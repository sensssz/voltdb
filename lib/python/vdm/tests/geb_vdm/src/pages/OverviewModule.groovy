/*
This file is part of VoltDB.

Copyright (C) 2008-2015 VoltDB Inc.

This file contains original code and/or modifications of original code.
Any modifications made by VoltDB Inc. are licensed under the following
terms and conditions:

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

import geb.Page
import geb.Module

class OverviewModule extends Module {
    static content = {
        // Site Per Host
        sitePerHostText                 { $("#divDbManager > div:nth-child(6) > div > div.col-md-6.clusterConfigLeft > div > div.mainTbl > table > tbody > tr:nth-child(1) > td.configLabel") }
        sitePerHostField                { $(id:"txtSitePerHost") }

        // K-Safety
        ksafetyText                     { $("#divDbManager > div:nth-child(6) > div > div.col-md-6.clusterConfigLeft > div > div.mainTbl > table > tbody > tr:nth-child(2) > td.configLabel") }
        ksafetyField                    { $(id:"txtKSafety") }

        // Partition Detection
        partitionDetectionText          { $("#divDbManager > div:nth-child(6) > div > div.col-md-6.clusterConfigLeft > div > div.mainTbl > table > tbody > tr.security > td.configLabel") }
        partitionDetectionCheckbox      { $("#divDbManager > div:nth-child(6) > div > div.col-md-6.clusterConfigLeft > div > div.mainTbl > table > tbody > tr.security > td:nth-child(2) > div > ins") }
        partitionDetectionStatus        { $(id:"txtPartitionDetection") }

        // Security
        securityText                    { $("#row-6 > td.configLabel > a > span") }
        securityCheckbox                { $("#row-6 > td:nth-child(2) > div > ins") }
        securityStatus                  { $("#txtSecurity") }

        usernameTitleText               { $("#divDbManager > div:nth-child(6) > div > div.col-md-6.clusterConfigLeft > div > div.mainTbl > table > tbody > tr.child-row-6.subLabelRow.thead.secTbl1 > td.configLabel") }
        roleTitleText                   { $("#divDbManager > div:nth-child(6) > div > div.col-md-6.clusterConfigLeft > div > div.mainTbl > table > tbody > tr.child-row-6.subLabelRow.thead.secTbl1 > td:nth-child(2)") }
        addUserButton                   { $("#btnAddSecurity > span") }

        // HTTP Access
        httpAccessText                  { $("#row-1 > td.configLabel > a > span") }
        httpAccessCheckbox              { $("#row-1 > td:nth-child(2) > div > ins") }
        httpAccessStatus                { $(id:"txtHttpAccess") }

        jsonApiText                     {$("#divDbManager > div:nth-child(6) > div > div.col-md-6.clusterConfigLeft > div > div.mainTbl > table > tbody > tr.child-row-1.subLabelRow > td.configLabel")}
        jsonApiCheckbox                 { $(id:"chkAutoSnapshot") }

        // Auto Snapshots
        autoSnapshotsText               { $("#row-2 > td.configLabel > a > span") }
        autoSnapshotsCheckbox           { $("#row-2 > td:nth-child(2) > div > ins") }
        autoSnapshotsStatus             { $(id:"txtAutoSnapshot") }

        filePrefixText                  { $("#divDbManager > div:nth-child(6) > div > div.col-md-6.clusterConfigLeft > div > div.mainTbl > table > tbody > tr:nth-child(10) > td.configLabel") }
        frequencyText                   { $("#divDbManager > div:nth-child(6) > div > div.col-md-6.clusterConfigLeft > div > div.mainTbl > table > tbody > tr:nth-child(11) > td.configLabel") }
        retainedText                    { $("#divDbManager > div:nth-child(6) > div > div.col-md-6.clusterConfigLeft > div > div.mainTbl > table > tbody > tr:nth-child(12) > td.configLabel") }

        filePrefixField                 { $(id:"txtFilePrefix") }
        frequencyField                  { $(id:"txtFrequency") }
        retainedField                   { $(id:"txtRetained") }

        // Command Logging
        commandLoggingText              { $(class:"fontFamily", text:"Command Logging") }
        commandLoggingCheckbox          { $("#row-3 > td:nth-child(2) > div > ins") }
        commandLoggingStatus            { $(id:"txtCommandLog") }

        logFrequencyTimeText            { $("td", class:"configLabel", 13) }
        logFrequencyTransactionsText    { $("td", class:"configLabel", 14) }
        logSegmentSizeText              { $("td", class:"configLabel", 15) }

        logFrequencyTimeField           { $(id:"txtLogFrequencyTime") }
        logFrequencyTransactionsField   { $(id:"txtLogFreqTransaction") }
        logSegmentSizeField             { $(id:"txtLogSegmentSize") }

        // Export
        exportText                      { $(class:"fontFamily", text: "Export") }
        exportCheckbox                  { $("") }

        // Import
        importText                      { $(class:"fontFamily", text: "Import") }
        importCheckbox                  { $("") }

        // Advanced
        advancedText                    { $(class:"fontFamily", text: "Advanced") }

        maxJavaHeapText                 { $("#divDbManager > div:nth-child(6) > div > div.col-md-6.clusterConfigLeft > div > div.mainTbl > table > tbody > tr:nth-child(24) > td.configLabel") }
        maxJavaHeapField                { $(id:"txtMaxJavaHeap") }

        heartbeatTimeoutText            { $("#divDbManager > div:nth-child(6) > div > div.col-md-6.clusterConfigLeft > div > div.mainTbl > table > tbody > tr:nth-child(25) > td.configLabel") }
        heartbeatTimeoutField           { $(id:"txtHeartbeatTimeout") }

        queryTimeoutText                { $("#divDbManager > div:nth-child(6) > div > div.col-md-6.clusterConfigLeft > div > div.mainTbl > table > tbody > tr:nth-child(26) > td.configLabel") }
        queryTimeoutField               { $(id:"txtQueryTimeout") }

        maxTempTableMemoryText          { $("#divDbManager > div:nth-child(6) > div > div.col-md-6.clusterConfigLeft > div > div.mainTbl > table > tbody > tr:nth-child(27) > td.configLabel") }
        maxTempTableMemoryField         { $(id:"txtMaxTempTableMemory") }

        snapshotPriorityText            { $("#divDbManager > div:nth-child(6) > div > div.col-md-6.clusterConfigLeft > div > div.mainTbl > table > tbody > tr:nth-child(28) > td.configLabel") }
        snapshotPriorityField           { $(id:"txtSnapshotPriority") }

        memoryLimitText                 { $("#divDbManager > div:nth-child(6) > div > div.col-md-6.clusterConfigLeft > div > div.mainTbl > table > tbody > tr:nth-child(29) > td.configLabel") }
        memoryLimitField                { $(id:"txtMemoryLimit") }
    }
}
