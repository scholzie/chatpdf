import {OpenAIApi, Configuration} from 'openai-edge'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

