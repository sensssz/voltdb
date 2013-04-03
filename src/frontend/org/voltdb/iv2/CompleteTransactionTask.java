/* This file is part of VoltDB.
 * Copyright (C) 2008-2013 VoltDB Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with VoltDB.  If not, see <http://www.gnu.org/licenses/>.
 */

package org.voltdb.iv2;

import java.io.IOException;

import org.voltdb.PartitionDRGateway;
import org.voltdb.SiteProcedureConnection;
import org.voltdb.StoredProcedureInvocation;
import org.voltdb.messaging.CompleteTransactionMessage;
import org.voltdb.messaging.FragmentTaskMessage;
import org.voltdb.messaging.Iv2InitiateTaskMessage;
import org.voltdb.rejoin.TaskLog;

public class CompleteTransactionTask extends TransactionTask
{
    final private CompleteTransactionMessage m_completeMsg;
    final private PartitionDRGateway m_drGateway;

    public CompleteTransactionTask(TransactionTaskQueue queue,
                                   CompleteTransactionMessage msg,
                                   PartitionDRGateway drGateway)
    {
        super(queue, msg);
        m_completeMsg = msg;
        m_drGateway = drGateway;
    }

    @Override
    public void run(SiteProcedureConnection siteConnection)
    {
        hostLog.debug("STARTING: " + this);
        // Add a check for running a CompleteTransactionTask against a ParticipantTransactionState
        // which thinks it's already done.  We send many extra CompleteTransactionMessages, so
        // this could happen, just bail.
        if (m_txnState.isDone()) {
            hostLog.debug("REDUNDANT: " + this);
            return;
        }

        m_txnState.handleMessage(m_msg);

        if (m_txnState.isDone()) {
            doCommonSPICompleteActions(siteConnection);

            // Log invocation to DR
            // This needs to go to doCommonSPICompleteActions, which means
            // that the DR reference needs to come from the state
            // TODO: FIX ME!
            //logToDR();
            hostLog.debug("COMPLETE: " + this);
        }
        else
        {
            // doCommonSPICompleteActions() takes care of undo log in non-restart path
            // factor this code out at some point
            if (!m_txnState.isReadOnly()) {
                // the truncation point token SHOULD be part of m_txn. However, the
                // legacy interaces don't work this way and IV2 hasn't changed this
                // ownership yet. But truncateUndoLog is written assuming the right
                // eventual encapsulation.
                siteConnection.truncateUndoLog(m_txnState.needsRollback(),
                        m_txnState.getBeginUndoToken(),
                        m_txnState.txnId,
                        m_txnState.spHandle);
            }
            // If we're going to restart the transaction, then reset the begin undo token so the
            // first FragmentTask will set it correctly.  Otherwise, don't set the Done state or
            // flush the queue; we want the TransactionTaskQueue to stay blocked on this TXN ID
            // for the restarted fragments.
            m_txnState.setBeginUndoToken(Site.kInvalidUndoToken);
            hostLog.debug("RESTART: " + this);
        }
    }

    @Override
    public void runForRejoin(SiteProcedureConnection siteConnection, TaskLog taskLog)
    throws IOException
    {
        if (!m_completeMsg.isRestart()) {
            // future: offer to siteConnection.IBS for replay.
            doCommonSPICompleteActions(siteConnection);
        }
        // We need to log the restarting message to the task log so we'll replay the whole
        // stream faithfully
        taskLog.logTask(m_completeMsg);
    }

    @Override
    public long getSpHandle()
    {
        return m_completeMsg.getSpHandle();
    }

    @Override
    public boolean shouldBlockQueue()
    {
        return false;
    }

    @Override
    public void runFromTaskLog(SiteProcedureConnection siteConnection)
    {
        if (!m_txnState.isReadOnly()) {
            // the truncation point token SHOULD be part of m_txn. However, the
            // legacy interaces don't work this way and IV2 hasn't changed this
            // ownership yet. But truncateUndoLog is written assuming the right
            // eventual encapsulation.
            siteConnection.truncateUndoLog(m_completeMsg.isRollback(),
                    m_txnState.getBeginUndoToken(),
                    m_txnState.txnId,
                    m_txnState.spHandle);
        }
        if (!m_completeMsg.isRestart()) {
            // this call does the right thing with a null TransactionTaskQueue
            doCommonSPICompleteActions(siteConnection);
            // TODO: FIX DR LOGGING --izzy
            //logToDR();
        }
        else {
            m_txnState.setBeginUndoToken(Site.kInvalidUndoToken);
        }
    }

    private void logToDR()
    {
        // Log invocation to DR
        if (m_drGateway != null && !m_txnState.isForReplay() && !m_txnState.isReadOnly() &&
            !m_completeMsg.isRollback())
        {
            FragmentTaskMessage fragment = (FragmentTaskMessage) m_txnState.getNotice();
            Iv2InitiateTaskMessage initiateTask = fragment.getInitiateTask();
            assert(initiateTask != null);
            StoredProcedureInvocation invocation = initiateTask.getStoredProcedureInvocation().getShallowCopy();
            m_drGateway.onSuccessfulMPCall(m_txnState.spHandle,
                    m_txnState.txnId,
                    m_txnState.uniqueId,
                    m_completeMsg.getHash(),
                    invocation,
                    m_txnState.getResults());
        }
    }

    @Override
    public String toString()
    {
        StringBuilder sb = new StringBuilder();
        sb.append("CompleteTransactionTask:");
        sb.append("  TXN ID: ").append(TxnEgo.txnIdToString(getTxnId()));
        sb.append("  SP HANDLE: ").append(TxnEgo.txnIdToString(getSpHandle()));
        sb.append("  UNDO TOKEN: ").append(m_txnState.getBeginUndoToken());
        sb.append("  MSG: ").append(m_completeMsg.toString());
        return sb.toString();
    }
}
