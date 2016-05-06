#include <jni.h>
#include <cassert>
#include <iostream>

using std::cout;
using std::endl;

static __thread JNIEnv   *env = nullptr;
static __thread jclass    trace_tool = nullptr;
static __thread jmethodID trace_function_start = nullptr;
static __thread jmethodID trace_function_end = nullptr;
static __thread jmethodID trace_start = nullptr;
static __thread jmethodID trace_end = nullptr;

void init_trace_tool(JNIEnv *jenv) {
    if (env != jenv) {
        env = jenv;
        trace_tool = env->FindClass("org/voltdb/TraceTool");
#ifdef DEBUG
        assert(trace_tool);
#endif
        trace_function_start = env->GetStaticMethodID(trace_tool, "TRACE_FUNCTION_START", "()V");
        trace_function_end = env->GetStaticMethodID(trace_tool, "TRACE_FUNCTION_END", "()V");
        trace_start = env->GetStaticMethodID(trace_tool, "TRACE_START", "()Z");
        trace_end = env->GetStaticMethodID(trace_tool, "TRACE_END", "(I)Z");
#ifdef DEBUG
        assert(trace_function_start && trace_function_end && trace_start && trace_end);
#endif
    }
}

void TRACE_FUNCTION_START() {
#ifdef DEBUG
    assert(env && trace_tool && trace_function_start);
#endif
    env->CallStaticVoidMethod(trace_tool, trace_function_start);
}

void TRACE_FUNCTION_END() {
#ifdef DEBUG
    assert(env && trace_tool && trace_function_start);
#endif
    env->CallStaticVoidMethod(trace_tool, trace_function_end);
}

bool TRACE_START() {
#ifdef DEBUG
    assert(env && trace_tool && trace_function_start);
#endif
    env->CallStaticBooleanMethod(trace_tool, trace_start);
    return false;
}

bool TRACE_END(int index) {
#ifdef DEBUG
    assert(env && trace_tool && trace_function_start);
#endif
    env->CallStaticBooleanMethod(trace_tool, trace_end, index);
    return false;
}
