import os

def init_phoenix():
    api_key = os.environ.get("PHOENIX_API_KEY")
    if not api_key:
        print("WARNING: PHOENIX_API_KEY not set — tracing disabled")
        return None

    os.environ["PHOENIX_COLLECTOR_ENDPOINT"] = "https://app.phoenix.arize.com/s/siriapps3"

    from phoenix.otel import register
    from openinference.instrumentation.google_adk import GoogleADKInstrumentor

    tracer_provider = register(project_name="mergeguard")
    GoogleADKInstrumentor().instrument(tracer_provider=tracer_provider)
    print("Phoenix tracing initialized — project: mergeguard")
    return tracer_provider
