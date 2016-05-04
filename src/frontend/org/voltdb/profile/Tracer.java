package org.voltdb.profile;

import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class Tracer {
    private static final int NUM_FUNCTIONS = 22;
    private static final boolean MONITOR = true;
    private static List<List<Integer>> execTime = new ArrayList<>();
    private static ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
    private static ThreadLocal<Long> functionStart = new ThreadLocal<>();
    private static ThreadLocal<Long> functionEnd = new ThreadLocal<>();
    private static ThreadLocal<Long> callStart = new ThreadLocal<>();
    private static ThreadLocal<Long> callEnd = new ThreadLocal<>();
    // Public interface
    public static void TRACE_FUNCTION_START() {
        functionStart.set(System.nanoTime());
    }
    public static void TRACE_FUNCTION_END() {
        functionEnd.set(System.nanoTime());
        long duration = functionEnd.get() - functionStart.get();
        tracer.addRecord(0, duration);
    }
    public static void TRACE_START() {
        callStart.set(System.nanoTime());
    }
    public static void TRACE_END(int index) {
        callEnd.set(System.nanoTime());
        long duration = callEnd.get() - callStart.get();
        tracer.addRecord(index, duration);
    }

    private static Tracer tracer = new Tracer();

    public static Tracer getInstance() {
        return tracer;
    }

    private static AtomicInteger trxId = new AtomicInteger(0);
    private ThreadLocal<Integer> currTrxId = new ThreadLocal<>();

    private Tracer() {
        for (int count = 0; count < NUM_FUNCTIONS; ++count) {
            List<Integer> list = new ArrayList<>();
            list.add(0);
            execTime.add(list);
        }
    }

    public void trxStart() {
        currTrxId.set(trxId.getAndIncrement());
        lock.writeLock().lock();
        for (List<Integer> functions : execTime) {
            functions.add(0);
        }
        lock.writeLock().unlock();
    }

    public void trxEnd() {
        lock.readLock().lock();
        lock.readLock().unlock();
    }

    public void addRecord(int index, long duration) {
        lock.readLock().lock();
        long oldDuration = execTime.get(index).get(currTrxId.get());
        execTime.get(index).set(currTrxId.get(), (int) (oldDuration + duration));
        lock.writeLock().unlock();
    }

    public void writeLog() {
        try {
            PrintWriter writer = new PrintWriter(new FileWriter("latency"));
            lock.writeLock().lock();
            int index = 0;
            for (List<Integer> functions : execTime) {
                for (Integer duration : functions) {
                    writer.println(index + "," + duration);
                }
            }
            execTime.clear();
            lock.writeLock().unlock();
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
