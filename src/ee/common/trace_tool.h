#include <jni.h>

#define TRACE_S_E(function, index) (TRACE_START() | (function) | TRACE_END(index))

void init_trace_tool(JNIEnv *env);
void TRACE_FUNCTION_START();
void TRACE_FUNCTION_END();
bool TRACE_START();
bool TRACE_END(int index);