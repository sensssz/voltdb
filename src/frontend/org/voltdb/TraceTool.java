package org.voltdb;

import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class TraceTool {
    private static final int NUM_FUNC = 2;
    private static final AtomicInteger trxID = new AtomicInteger(0);
    private static final ArrayList<ArrayList<Long>> latencies = new ArrayList<>(NUM_FUNC + 3);
    private static final List<Integer> failedTrx = new ArrayList<>();
    private static final ReentrantReadWriteLock latencyLock = new ReentrantReadWriteLock();
    private static final Thread checkingQueryThread;
    private static long lastQueryStartTime = 0;
    private static boolean starts = false;
    static {
        for (int index = 0; index < NUM_FUNC + 3; ++index) {
            latencies.add(new ArrayList<>());
        }
        checkingQueryThread = new Thread(() -> {
            while (true) {
                try {
                    Thread.sleep(5000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                long now = System.nanoTime();
                if (now - lastQueryStartTime >= 5e9 && trxID.get() > 0) {
                    dumpData();
                    trxID.set(0);
                    starts = false;
                }
            }
        });
        checkingQueryThread.start();
    }

    private static void dumpData() {
        try {
            PrintWriter writer = new PrintWriter(new FileWriter("latency"));
            latencyLock.writeLock().lock();
            System.out.println(latencies.get(0).size() + " transactions in total, " + failedTrx.size() + " failed transactions.");
            for (int failed : failedTrx) {
                for (ArrayList<Long> funcLatency : latencies) {
                    funcLatency.set(failed, -1L);
                }
            }
            for (int index = 0; index < latencies.size(); ++index) {
                ArrayList<Long> funcLatency = latencies.get(index);
                for (Long latency : funcLatency) {
                    if (latency != -1) {
                        assert (latency > 0);
                        writer.println(index + "," + latency);
                    }
                }
                funcLatency.clear();
                funcLatency.add(0L);
            }
            failedTrx.clear();
            latencyLock.writeLock().unlock();
            writer.close();

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static long trxStartTime;
    private static ThreadLocal<Integer> currTrxID = new ThreadLocal<Integer>() {
        @Override protected Integer initialValue() {
            return 0;
        }
    };
    private static ThreadLocal<Boolean> successful = new ThreadLocal<>();
    private static ThreadLocal<Long> functionStart = new ThreadLocal<>();
    private static ThreadLocal<Long> callStart = new ThreadLocal<>();

    public static boolean isTarget(String procName) {
        return procName.contains("neworder") ||
                procName.contains("ostat") ||
                (procName.contains("payment") && !procName.contains("W")) ||
                procName.contains("slev") ||
                procName.contains("delivery");
    }

    public static void start() {
        if (!starts) {
            System.out.println("Monitor is started");
            starts = true;
        }
    }

    public static void trx_start(long timeBeforePickedUp) {
        if (!starts) {
            return;
        }
        successful.set(true);
        trxStartTime = System.nanoTime();
        lastQueryStartTime = trxStartTime;
        latencyLock.writeLock().lock();
        for (ArrayList<Long> funcLatency : latencies) {
            funcLatency.add(0L);
        }
        latencyLock.writeLock().unlock();
        currTrxID.set(trxID.getAndIncrement());
        // NUM_FUNC + 1 is the index for function other
        addRecord(NUM_FUNC + 1, timeBeforePickedUp);
        // NUM_FUNC + 1 is the index for latency
        addRecord(NUM_FUNC + 2, timeBeforePickedUp);
    }

    public static void trx_fails() {
        successful.set(false);
        synchronized (failedTrx) {
            failedTrx.add(currTrxID.get());
        }
    }

    public static void trx_end() {
        if (!starts) {
            return;
        }
        long latency = System.nanoTime() - trxStartTime;
        addRecord(NUM_FUNC + 2, latency);
    }

    public static void TRACE_FUNCTION_START() {
        if (!starts) {
            return;
        }
        functionStart.set(System.nanoTime());
    }

    public static void TRACE_FUNCTION_END() {
        if (!starts) {
            return;
        }
        long functionEnd = System.nanoTime();
        addRecord(0, functionEnd - functionStart.get());
    }

    public static boolean TRACE_START() {
        if (!starts) {
            return false;
        }
        callStart.set(System.nanoTime());
        return false;
    }

    public static boolean TRACE_END(int index) {
        if (!starts) {
            return false;
        }
        long callEnd = System.nanoTime();
        addRecord(index, callEnd - callStart.get());
        return false;
    }

    private static void addRecord(int index, long duration) {
        if (currTrxID.get() > trxID.get()) {
            currTrxID.set(trxID.getAndIncrement());
        }
        latencyLock.readLock().lock();
        long oldDuration = latencies.get(index).get(currTrxID.get());
        latencies.get(index).set(currTrxID.get(), oldDuration + duration);
        latencyLock.readLock().unlock();
    }
}
