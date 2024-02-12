Application steps

## Generating embeddings
1. Get PDF document
2. Split & segment pdf (w/ langchain)
3. Vectorize document(s) and embed
4. Store vectors into pineconedb

## Searching
1. Get embeddings for query
2. Query pineconedb for similar vectors
3. Extract metadata from result
4. Feed metadata to openai