package org.voltdb;

import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class TraceTool {
    private static final int NUM_FUNC = 20;
    private static final AtomicInteger trxID = new AtomicInteger(0);
    private static final ArrayList<ArrayList<Integer>> latencies = new ArrayList<>(NUM_FUNC + 3);
    private static final ReentrantReadWriteLock latencyLock = new ReentrantReadWriteLock();
    private static final Thread checkingQueryThread;
    private static long lastQueryStartTime = 0;
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
                }
            }
        });
        checkingQueryThread.start();
    }

    private static void dumpData() {
        try {
            PrintWriter writer = new PrintWriter(new FileWriter("latency"));
            latencyLock.writeLock().lock();
            for (int index = 0; index < latencies.size(); ++index) {
                ArrayList<Integer> funcLatency = latencies.get(index);
                for (Integer latency : funcLatency) {
                    writer.println(index + "," + latency);
                }
                funcLatency.clear();
                funcLatency.add(0);
            }
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
    private static ThreadLocal<Long> functionStart = new ThreadLocal<>();
    private static ThreadLocal<Long> callStart = new ThreadLocal<>();

    public static void trx_start(long timeBeforePickedUp) {
        trxStartTime = System.nanoTime();
        lastQueryStartTime = trxStartTime;
        latencyLock.writeLock().lock();
        for (ArrayList<Integer> funcLatency : latencies) {
            funcLatency.add(0);
        }
        latencyLock.writeLock().unlock();
        currTrxID.set(trxID.getAndIncrement());
        // NUM_FUNC + 1 is the index for function other
        addRecord(NUM_FUNC + 1, timeBeforePickedUp);
        // NUM_FUNC + 1 is the index for latency
        addRecord(NUM_FUNC + 2, timeBeforePickedUp);
    }

    public static void trx_end() {
        long latency = System.nanoTime() - trxStartTime;
        if (latency > latencies.get(NUM_FUNC + 2).get(currTrxID.get())) {
            System.out.println("Latency is longer than wait time");
        }
        addRecord(NUM_FUNC + 2, latency);
    }

    public static void TRACE_FUNCTION_START() {
        functionStart.set(System.nanoTime());
    }

    public static void TRACE_FUNCTION_END() {
        long functionEnd = System.nanoTime();
        addRecord(0, functionEnd - functionStart.get());
    }

    public static boolean TRACE_START() {
        callStart.set(System.nanoTime());
        return false;
    }

    public static boolean TRACE_END(int index) {
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
        latencies.get(index).set(currTrxID.get(), (int) (oldDuration + duration));
        latencyLock.readLock().unlock();
    }
}
