from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    NASA_API_KEY: str = "DEMO_KEY"
    WATSONX_API_KEY: str = ""
    WATSONX_PROJECT_ID: str = ""
    WATSONX_URL: str = "https://au-syd.ml.cloud.ibm.com"
    # LLM on watsonx.ai instance (text_generation)
    WATSONX_MODEL_ID: str = "meta-llama/llama-3-3-70b-instruct"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
