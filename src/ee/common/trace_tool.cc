#include <jni.h>
#include <cassert>
#include <iostream>

using std::cout;
using std::endl;

static JNIEnv   *env;
static jclass    trace_tool;
static jmethodID trace_function_start;
static jmethodID trace_function_end;
static jmethodID trace_start;
static jmethodID trace_end;

void init_trace_tool(JNIEnv *jenv) {
    if (env == nullptr) {
        cout << "Initializing trace_tool" << endl;
        env = jenv;
        trace_tool = env->FindClass("org/voltdb/TraceTool");
        assert(jclass);
        trace_function_start = env->GetStaticMethodID(trace_tool, "TRACE_FUNCTION_START", "()V");
        trace_function_end = env->GetStaticMethodID(trace_tool, "TRACE_FUNCTION_END", "()V");
        trace_start = env->GetStaticMethodID(trace_tool, "TRACE_START", "()Z");
        trace_end = env->GetStaticMethodID(trace_tool, "TRACE_END", "(I)Z");
        assert(trace_function_start && trace_function_end && trace_start && trace_end);
    }
}

void TRACE_FUNCTION_START() {
    cout << "Calling TRACE_FUNCTION_START" << endl;
    env->CallStaticVoidMethod(trace_tool, trace_function_start);
}

void TRACE_FUNCTION_END() {
    cout << "Calling TRACE_FUNCTION_END" << endl;
    env->CallStaticVoidMethod(trace_tool, trace_function_end);
}

bool TRACE_START() {
    cout << "Calling TRACE_START" << endl;
    env->CallStaticBooleanMethod(trace_tool, trace_start);
    return false;
}

bool TRACE_END(int index) {
    cout << "Calling TRACE_END" << endl;
    env->CallStaticBooleanMethod(trace_tool, trace_end, index);
    return false;
}
