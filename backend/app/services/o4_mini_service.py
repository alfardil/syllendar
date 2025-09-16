"""Initialize our GPT object to make API calls."""

import os
import tiktoken
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


class OpenAIo4Service:
    """Defines the OpenAI 4o object."""

    def __init__(self):
        self.default_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = "o4-mini-2025-04-16"
        self.encoding = tiktoken.get_encoding("o200k_base")
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.base_url = "https://api.openai.com/v1/chat/completions"
        self.reasoning_effort = "low"

    def count_tokens(self, prompt: str) -> int:
        """
        Counts the number of tokens in a prompt.

        Args:
            prompt (str): The prompt to count tokens for

        Returns:
            int: Estimated number of input tokens
        """
        num_tokens = len(self.encoding.encode(prompt))
        return num_tokens
