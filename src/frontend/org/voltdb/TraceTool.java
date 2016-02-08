package org.voltdb;

import org.voltdb.sysprocs.SystemCatalog;

import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class TraceTool {
    private static final int NUM_FUNC = 10;
    private static final AtomicInteger trxID = new AtomicInteger(0);
    private static final ArrayList<ArrayList<Integer>> latencies = new ArrayList<>(NUM_FUNC + 2);
    private static final ReentrantReadWriteLock latencyLock = new ReentrantReadWriteLock();
    private static final Thread checkingQueryThread;
    private static long lastQueryStartTime = 0;
    public static ThreadLocal<Boolean> shouldTrace;
    static {
        for (int index = 0; index < latencies.size(); ++index) {
            ArrayList<Integer> funcLatency = new ArrayList<>();
            funcLatency.add(0);
            latencies.add(funcLatency);
        }
        checkingQueryThread = new Thread(() -> {
            while (true) {
                long now = System.nanoTime();
                if (now - lastQueryStartTime >= 5e9 && trxID.get() > 0) {
                    dumpData();
                    trxID.set(0);
                }
            }
        });
        checkingQueryThread.start();
        shouldTrace = new ThreadLocal<>();
        shouldTrace.set(Boolean.FALSE);
    }

    private static void dumpData() {
        try {
            PrintWriter writer = new PrintWriter(new FileWriter("latency"));
            latencyLock.writeLock().lock();
            for (int index = 0; index < latencies.size(); ++index) {
                ArrayList<Integer> funcLatency = latencies.get(index);
                for (Integer latency : funcLatency) {
                    writer.println(index + latency);
                }
                funcLatency.clear();
                funcLatency.add(0);
            }
            latencies.clear();
            latencyLock.writeLock().unlock();

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static long trxStartTime;
    private static int currTrxID;
    private long functionStart;
    private long functionEnd;
    private long callStart;
    private long callEnd;

    TraceTool() {
        currTrxID = trxID.getAndIncrement();
    }

    public void trx_start() {
        trxStartTime = System.nanoTime();
    }

    public void trx_end() {
        int latency = (int) (System.nanoTime() - trxStartTime);
        latencyLock.writeLock().lock();
        latencies.get(NUM_FUNC + 1).set(currTrxID, latency);
        for (ArrayList<Integer> funcLatency : latencies) {
            funcLatency.add(0);
        }
        latencyLock.writeLock().unlock();
        currTrxID = trxID.getAndIncrement();
    }

    public void TRACE_FUNCTION_START() {
        functionStart = System.nanoTime();
    }

    public void TRACE_FUNCTION_END() {
        functionEnd = System.nanoTime();
        latencyLock.readLock().lock();
        latencies.get(0).set(currTrxID, (int) (functionEnd - functionStart));
        latencyLock.readLock().unlock();
    }

    public boolean TRACE_START() {
        callStart = System.nanoTime();
        return false;
    }

    public boolean TRACE_END(int index) {
        callEnd = System.nanoTime();
        latencyLock.readLock().lock();
        latencies.get(index).set(currTrxID, (int) (callEnd - callStart));
        latencyLock.readLock().unlock();
        return false;
    }
}
