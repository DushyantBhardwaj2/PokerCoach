# Poker Knowledge Base Directory

Place canonical Texas Hold'em strategy PDF files into this folder to be ingested by the RAG pipeline.

### Canonical Books Supported:
1. *The Theory of Poker* — David Sklansky
2. *Harrington on Hold 'em* — Dan Harrington & Bill Robertie
3. *Applications of No-Limit Hold 'em* — Matthew Janda
4. *The Mathematics of Poker* — Bill Chen & Jerrod Ankenman
5. *Modern Poker Theory* — Michael Acevedo
6. *Poker Math That Matters* — James Chesterton
7. *10 Things Good Poker Players Don't Do* — Red Chip Poker

To ingest books and build the vector/lexical index, run:
```bash
python -m src.ingest
```
