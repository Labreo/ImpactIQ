from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    NASA_API_KEY: str = "DEMO_KEY"
    WATSONX_API_KEY: str = ""
    WATSONX_PROJECT_ID: str = ""
    WATSONX_URL: str = "https://us-south.ml.cloud.ibm.com"
    # Sydney region has granite-8b-code-instruct (text_chat + text_generation)
    # and granite-guardian-3-8b.  granite-8b-code-instruct is our primary LLM.
    WATSONX_MODEL_ID: str = "ibm/granite-8b-code-instruct"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
