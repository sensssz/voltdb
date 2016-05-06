#include <jni.h>
#include <cassert>
#include <iostream>

using std::cout;
using std::endl;

static JNIEnv   *env = nullptr;
static jclass    trace_tool = nullptr;
static jmethodID trace_function_start = nullptr;
static jmethodID trace_function_end = nullptr;
static jmethodID trace_start = nullptr;
static jmethodID trace_end = nullptr;

void init_trace_tool(JNIEnv *jenv) {
    if (env == nullptr) {
        env = jenv;
        trace_tool = env->FindClass("org/voltdb/TraceTool");
        assert(trace_tool);
        trace_function_start = env->GetStaticMethodID(trace_tool, "TRACE_FUNCTION_START", "()V");
        trace_function_end = env->GetStaticMethodID(trace_tool, "TRACE_FUNCTION_END", "()V");
        trace_start = env->GetStaticMethodID(trace_tool, "TRACE_START", "()Z");
        trace_end = env->GetStaticMethodID(trace_tool, "TRACE_END", "(I)Z");
        assert(trace_function_start && trace_function_end && trace_start && trace_end);
    }
}

void TRACE_FUNCTION_START() {
    assert(env && trace_tool && trace_function_start);
    env->CallStaticVoidMethod(trace_tool, trace_function_start);
}

void TRACE_FUNCTION_END() {
    assert(env && trace_tool && trace_function_start);
    env->CallStaticVoidMethod(trace_tool, trace_function_end);
}

bool TRACE_START() {
    assert(env && trace_tool && trace_function_start);
    env->CallStaticBooleanMethod(trace_tool, trace_start);
    return false;
}

bool TRACE_END(int index) {
    assert(env && trace_tool && trace_function_start);
    env->CallStaticBooleanMethod(trace_tool, trace_end, index);
    return false;
}
