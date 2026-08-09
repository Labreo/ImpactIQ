from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    NASA_API_KEY: str = "DEMO_KEY"
    WATSONX_API_KEY: str = ""
    WATSONX_PROJECT_ID: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
