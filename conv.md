Poker AI Coach - Product & RAG Requirements

In-depth Q&A record from the design conversation

1. Project Snapshot

Goal. Build a basic Texas Hold’em poker coaching application whose main showcase is a grounded RAG pipeline. The application observes the manually entered current hand state, combines it with persistent opponent information, retrieves relevant strategy from seven locally stored poker books, and asks Gemini to respond as a human-like poker coach only when it is the user’s turn.

Design principle. Keep the user experience simple and coach-like. Hide technical RAG machinery from normal users. Keep the implementation simple enough for a college project, while making the RAG flow technically clear and explainable.

2. Locked High-Level Architecture

Layer

Decision / Technology

Frontend

Astro + React. Rebuild/adapt the visual UI from the supplied Poker_AI GitHub repository as a design reference.

Backend

Python backend with FastAPI; core poker state, persistence, ingestion, retrieval, and Gemini integration live here.

Relational data

PostgreSQL. Store users, sessions/tables, hands, actions, and isolated opponent profiles/history.

RAG vector store

Persistent local ChromaDB at project level, one collection named poker_books.

Embeddings

Local open-source BAAI/bge-base-en-v1.5. Use the local machine’s GPU when practical.

Keyword retrieval

BM25 implemented in Python.

Hybrid retrieval

70% semantic/vector similarity + 30% BM25, then select top 5 passages. No reranker.

LLM

Gemini API using the user-selected Gemini Flash 3.6 model/version.

Book ingestion

One-time ingestion of the seven fixed, text-selectable PDFs using PyMuPDF (fitz).

Book metadata

Store book_name + chapter with each paragraph chunk; preserve original paragraph text and embedding.

Coach output

One natural-language coach paragraph only. Include recommendation, sizing where relevant, reasoning, and book citation naturally.

3. Core RAG Flow

Fixed seven poker PDFs are ingested once into a persistent ChromaDB collection.

Each PDF is text-extracted with PyMuPDF, cleaned, split into independent paragraph chunks, embedded locally, and stored with book_name and chapter metadata.

When it is the user’s turn, the Python backend creates a simple deterministic poker situation summary from the current hand state and opponent summary.

That situation summary is used as the retrieval query for both vector similarity and BM25 keyword search.

The two retrieval paths are combined using the agreed 70/30 weighted approach; the best five passages are selected with no separate reranker.

The five retrieved passages are combined into one context block with metadata.

Gemini receives the current hand context, summarized opponent history, and the retrieved book context.

Gemini returns one coach-style paragraph. It must not invent citations and should rely on the retrieved material for grounded strategic support.

The frontend shows only the coach experience; technical retrieval details are not exposed to the user.

4. Full Design Q&A (Questions 1-85)

Question 1. What poker format should the app support initially?

Texas Hold’em. The intended MVP is effectively a straightforward No-Limit Texas Hold’em coaching app so betting decisions are meaningful and the RAG system can reason about real betting situations.

Question 2. How will the app receive game information?

The user manually enters the game information. This keeps the MVP focused on poker-state modeling and RAG instead of computer vision or table scraping.

Question 3. What should the user enter during a hand?

The user should define who is playing at the table, their starting chips, the user’s cards, the pre-flop betting, the flop, turn, river, and all meaningful actions/bet amounts that can change the course of the hand. The key requirement is to model the entire evolving hand state rather than just a few isolated fields.

Question 4. What should the AI suggest when it is the user’s decision point?

The AI should determine whether the user should bet or not bet and explain why. The broader agreed action set is Fold, Check, Call, Bet, and Raise, with bet sizing when applicable. The emphasis is on useful coaching rather than merely outputting a poker action.

Question 5. What knowledge sources should the AI use?

The AI should use the user’s poker books as its strategic knowledge source, along with the current game/hand state. The books are the core RAG knowledge base; the current hand supplies situational context.

Question 6. Should the AI remember how each opponent has played during the current session?

Yes. The application should maintain an opponent profile for the session, including useful betting and action patterns such as aggression, raises, folds, and showdown-related information.

Question 7. Should the app calculate poker metrics from entered actions?

Yes, but keep the metrics basic for the MVP. Examples discussed include VPIP, PFR, aggression frequency, and fold-to-c-bet. These statistics are supporting context, not the main product.

Question 8. Should opponent profiles persist beyond one hand/session?

Yes. The app should store opponent profiles and patterns so that a returning user can benefit from historical information about opponents they have played before.

Question 9. Where should opponent profiles and hand data be stored?

PostgreSQL. It is appropriate for the structured data: users, sessions/tables, hands, actions, opponent profiles, and related statistics.

Question 10. How should user isolation work?

Every user must have separate opponent data and game data. If two users have an opponent with the same displayed name, their records must remain isolated. A tenant/user identifier should be applied consistently so opponent histories never mix across users.

Question 11. Should the poker books be shared or user-specific?

The books are one shared global knowledge base available to every user. The RAG knowledge is centralized, while user/game/opponent data remains isolated per user.

Question 12. How should the AI present its recommendation?

The app should feel like a poker coach, not a calculator. The coach should explain the situation in natural language and make a clear recommendation. Book support should be visible through a natural citation, but technical RAG details should stay hidden.

Question 13. Should the coach explain its thinking before the user acts or only on request?

The coach should explain the situation at the user’s decision point. The desired experience is a coaching explanation such as what the coach is seeing, why the situation matters, and what action it recommends.

Question 14. When should the coach speak?

Only when it is the user’s turn to make a decision. This keeps the experience focused and avoids unnecessary LLM calls.

Question 15. Should the app review a hand after it finishes?

Yes. The app should provide a post-hand review explaining important good/bad decisions, with the reasoning grounded in the poker knowledge base. The review is another coaching moment, but the MVP should stay simple rather than becoming a large analytics platform.

Question 16. Should the coach use past hands?

Yes, but in a focused way. Past hands should mainly provide useful context for the coach rather than becoming an elaborate user-leak analytics system.

Question 17. Should the app automatically detect deep recurring user leaks?

No. This was intentionally kept out of scope. The project should remain a basic college project focused on the RAG coaching pipeline.

Question 18. Which vector database should be used?

ChromaDB. It should be persistent and run locally inside the project.

Question 19. How should PDFs be transformed for RAG?

PDF → extract text → clean text → split into paragraph chunks → generate embeddings → store in ChromaDB. This is the book-ingestion pipeline.

Question 20. Should the books be PDF-only?

Yes. The seven current books are PDFs and all contain selectable text, so OCR is unnecessary for the MVP.

Question 21. Which LLM should power the coach?

Gemini via the Gemini API, using the selected Gemini Flash 3.6 model/version.

Question 22. Should embeddings be local?

Yes. Use a small open-source local embedding model so the RAG knowledge base can be built and run locally.

Question 23. Which local embedding model was selected?

BAAI/bge-base-en-v1.5. It was selected as a stronger practical option for the available laptop hardware, while remaining a local embedding model suitable for a college-project deployment.

Question 24. What frontend stack should be used?

Astro + React. The visual interface should be rebuilt/adapted from the provided Poker_AI repository rather than reusing its backend architecture as-is.

Question 25. How should the supplied GitHub repository be used?

Use the repository primarily as the UI/UX reference. Rebuild the useful visual experience in Astro + React, while changing the backend logic on a large scale to support the new RAG-first application.

Question 26. Should the new UI simply copy the old application structure?

No. The desired approach is to study the existing UI, recreate/adapt its visual components, and then change functionality around the new requirements. The backend and application logic are the major rewrite.

Question 27. Should the app have login/signup?

Yes, but keep it simple. Use email/password authentication rather than OAuth.

Question 28. Which auth features are needed?

The project is intentionally basic. The essential flow is email/password signup, login, and logout. More elaborate identity features are not the focus.

Question 29. Should there be a demo login?

Yes. The app should provide a demo login so a user can immediately access the project without creating an account.

Question 30. Should the demo user have preloaded data?

Yes. Pre-populate the demo user with sample hands and opponent profiles so the RAG coach can be demonstrated immediately.

Question 31. How should the poker table UI behave?

The visual poker-table UI comes from the supplied repository’s design. The new project should rebuild/adapt that experience while the backend tracks the full hand state.

Question 32. Should the backend be dramatically changed even if the UI stays similar?

Yes. The UI is a visual reference; the backend is largely rebuilt around PostgreSQL, ChromaDB, deterministic retrieval-query construction, hybrid retrieval, and Gemini coaching.

Question 33. Should technical RAG details be shown to normal users?

No. Users should not see chunks, embeddings, retrieval scores, prompt construction, or similar implementation details. The product should feel like a coach.

Question 34. Should the book citation be visible?

Yes. The coach should cite the supporting poker book so the user can understand where the strategic support is coming from.

Question 35. Should the coach always cite a book?

The recommendation should include meaningful book support and the final answer should cite the source used. The important rule is that a citation must never be fabricated.

Question 36. Should retrieval use the whole hand state or a poker-specific situation?

Both. The system should use the complete hand context to construct a structured poker situation summary and then use that summary as the basis for retrieval.

Question 37. How many book chunks should be retrieved?

Top 5 relevant chunks per decision.

Question 38. What retrieval strategy should be used?

Hybrid retrieval: semantic/vector similarity plus keyword retrieval. This combines conceptual matching with exact poker terminology such as 3-bet, c-bet, BB, and BTN.

Question 39. Should there be a separate reranking model?

No. After combining the retrieval results, select the best five using the agreed weighted scoring approach. No dedicated reranker is needed for the MVP.

Question 40. Should opponent/user histories be stored in ChromaDB as RAG documents?

No. ChromaDB should contain only the poker books. Structured game and opponent data belongs in PostgreSQL and should be passed as context to Gemini.

Question 41. Should Python build a poker situation summary before retrieval?

Yes. The backend should convert the current structured game state into a simple retrieval-friendly summary before querying the knowledge base.

Question 42. Should the retrieval query be generated by an LLM?

No. Python should construct the retrieval query deterministically. This avoids an extra LLM call and makes retrieval more predictable and easy to explain.

Question 43. How complex should the Python retrieval-query pattern be?

Simple. The query can combine the street, position, hand, board, pot/bet context, and a concise opponent summary into a short poker-situation string.

Question 44. How should book chunks be created?

Paragraph-based chunking. Preserve paragraph boundaries instead of using arbitrary fixed-size token windows.

Question 45. Should chunks be overlapping?

No. Each paragraph is an independent chunk with no overlap.

Question 46. Should short paragraphs be merged?

The final preference is to keep the context short and focused. Use the paragraph as the basic independent chunk rather than building large combined chunks.

Question 47. What metadata should each chunk contain?

Only book_name and chapter. Page numbers were explicitly removed from the MVP requirements.

Question 48. Should PDF text be cleaned before chunking?

Yes. Clean extracted text to remove noise such as headers, footers, page artifacts, and awkward line breaks before storing paragraph chunks.

Question 49. How should the book name be identified?

Use the PDF filename as the book_name. This is a simple deterministic approach for the fixed seven-book project.

Question 50. How should chapter information be identified?

Detect chapter headings from the extracted PDF text and attach the detected chapter to each paragraph chunk.

Question 51. How many ChromaDB collections should there be?

One collection named poker_books containing all seven books. Use metadata to distinguish books and chapters.

Question 52. What exactly should be stored in ChromaDB?

Embedding, original paragraph text, book_name, and chapter. Nothing else is required for the MVP.

Question 53. Should the original paragraph text be preserved?

Yes. Preserve the exact source paragraph so retrieved evidence can be presented or referenced by the coach and citations can point back to the original book context.

Question 54. Should PDF page numbers be stored for citation?

No. Page-level citation was explicitly removed from scope. The required citation granularity is book plus chapter/section-level identification, with the final implementation keeping the agreed book_name + chapter metadata.

Question 55. When should books be ingested?

The seven fixed books should be ingested once in the backend and stored persistently in ChromaDB. The app should query the stored knowledge on later runs rather than reprocessing PDFs every startup.

Question 56. How should ingestion be launched?

Use a simple one-command script such as python ingest_books.py that scans the fixed books folder and builds the ChromaDB knowledge base.

Question 57. Where should the fixed books live?

All seven PDFs are in one folder. The ingestion script should scan that folder automatically.

Question 58. Where should ChromaDB data live?

Inside the project, for example data/chroma_db/. This keeps the vector store local and removes the need for an external vector database service.

Question 59. Should ingestion generate a report?

No. Keep the ingestion process minimal. A visible report is not required for the MVP.

Question 60. Should the system build replacement/version machinery for books?

No. The project assumes the seven PDFs are fixed and will be ingested once. The MVP does not need complex book versioning or update workflows.

Question 61. How should retrieval combine vector and keyword results?

Use the already agreed hybrid strategy: vector similarity plus BM25, with the combined ranking weighted 70% semantic similarity and 30% BM25, then keep the top five passages. No reranker is added.

Question 62. What should be included in the Gemini context?

The current hand situation, summarized opponent history, and one combined RAG context block containing the top five retrieved book paragraphs plus their metadata.

Question 63. How should opponent history be represented in the prompt?

Generate a compact summary in Python from PostgreSQL instead of dumping every raw hand record. Example shape: aggressive preflop, frequently 3-bets, large turn bets, rarely bluffs.

Question 64. Should the prompt contain all raw opponent histories?

No. The agreed design is current hand + a summarized opponent history. This preserves relevant behavioral context without unnecessarily bloating the prompt.

Question 65. Should user past hands be sent to Gemini?

No. Do not send the full user-hand history. The prompt should focus on the current hand and opponent history summary.

Question 66. Should the final prompt be one natural prompt or structured sections?

Use a clear internal structure for the context, but keep the visible Gemini output natural. The discussion settled on a single context block with metadata for the retrieved passages plus current-hand and opponent-summary context.

Question 67. What should Gemini return?

One natural coach-style paragraph only. No JSON is required and no multiple-field response is desired.

Question 68. Should the coach provide a clear recommendation?

Yes. The paragraph should contain one clear recommended action rather than a probability table or a list of many equally weighted choices.

Question 69. How should bet sizing be handled?

When relevant, the coach should naturally include a suggested size in the paragraph, such as a number of BB. The exact wording should remain conversational rather than being emitted as a separate machine field.

Question 70. Should the recommendation be editable before the user records the actual action?

No. The recommendation is advisory. The user records what they actually did; there is no extra edit/override layer for the AI recommendation.

Question 71. When should the RAG/Gemini call happen?

Only when the user is the active decision maker. Do not spend LLM calls on opponent actions or non-decision moments unless later implementation proves necessary for the post-hand review.

Question 72. Should the app include a post-hand coach review?

Yes. The hand review should use the completed hand state and the available evidence to explain notable decisions and what the player could learn from them.

Question 73. Should the coach build a long-term automatic leak-detection system?

No. Keep historical user data as useful context, but avoid adding a complex automatic coaching analytics system. The core project remains the RAG coach.

Question 74. What should the coach do when book evidence is weak or insufficient?

Do not force false certainty. The agreed rule is that the system should avoid making a confident recommendation when retrieved book evidence is not sufficient. It may explain that the material does not provide enough grounded support rather than inventing a source.

Question 75. Should there be a hard numerical retrieval relevance threshold?

No. There is no hard relevance cutoff in the MVP. The system should rely on the prompt’s grounding rules and the retrieved context.

Question 76. Should Gemini be told never to invent citations?

Yes. This is a core grounding rule: never invent a book, chapter, quotation, or claim that a source says something when the retrieved material does not support it.

Question 77. Should street information affect retrieval?

Yes. The current street should be part of the retrieval situation so preflop, flop, turn, and river decisions can retrieve different strategy concepts.

Question 78. Should the coach prioritize the current hand context?

Yes. The live hand state is the actual situation being solved; retrieved book knowledge acts as strategic guidance and evidence. The coach should apply the book concepts to the real hand rather than repeating generic passages.

Question 79. Should the RAG knowledge base contain only books?

Yes. ChromaDB is exclusively the book knowledge base. User/game/opponent information stays in PostgreSQL and is inserted into the LLM prompt as structured context.

Question 80. Should there be visible RAG diagnostics in the product UI?

No. The user should not see retrieval scores, embedding details, source chunks as technical objects, or prompt construction. Only the coach explanation and meaningful source citation should be visible.

Question 81. Should the app support multiple books?

Yes. All seven books should be supported from the start, stored in the same poker_books collection.

Question 82. What is the desired demo experience?

A user can log in with a simple account or demo login, reach the recreated poker UI, use preloaded demo hands/opponents, and trigger grounded coach recommendations without having to set up infrastructure interactively.

Question 83. What should the application prioritize over advanced product features?

RAG quality and explainability. The project should demonstrate a clear pipeline from fixed source books to retrieval to grounded Gemini coaching, rather than trying to become a production-scale poker platform.

Question 84. What are the final implementation priorities?

First build the persistent ChromaDB book knowledge base. Once the knowledge base works correctly, build the retrieval pipeline, then connect retrieval to Gemini, then connect the backend to the poker UI and PostgreSQL state. This ordering makes the RAG portion the foundation.

Question 85. What should the RAG system retrieve for the coach?

It should retrieve poker-book knowledge that is relevant to the actual situation: general strategy concepts plus the specific concepts needed for the decision, such as hand strength/range concepts, betting strategy, position, board texture, street-specific strategy, and opponent-related strategic considerations when the books cover them. Retrieval should remain grounded in the fixed poker books, while the current hand and opponent summary provide the situational context.

5. Final Locked Requirements

Area

Final decision

Game

Texas Hold’em; manual game-state entry; full street-by-street hand context.

Books

Seven fixed, selectable-text PDF poker books in one books folder.

Ingestion

One-time PyMuPDF extraction; clean text; independent paragraph chunks; no overlap; book_name + chapter metadata; local embeddings; persistent ChromaDB.

Vector DB

ChromaDB, one collection: poker_books, stored under the project.

Embeddings

BAAI/bge-base-en-v1.5 locally.

Keyword retrieval

BM25.

Hybrid retrieval

70% vector similarity + 30% BM25; top 5; no reranker.

Structured data

PostgreSQL for per-user isolated game and opponent data.

Prompt context

Current hand + summarized opponent history + top 5 retrieved book passages in one context block with metadata.

LLM

Gemini API / Gemini Flash 3.6 selected model/version.

Output

One coach-style paragraph only; clear recommendation; sizing when appropriate; natural citation; no JSON UI output.

Grounding

Never fabricate book citations or unsupported source claims; do not force confident advice when the book evidence is insufficient.

UI

Astro + React rebuilt/adapted from the supplied Poker_AI project UI reference.

Auth

Simple email/password login plus demo login; no OAuth.

Demo

Preloaded sample hands and opponent profiles.

Scope

Basic college project; prioritize RAG over advanced poker analytics.

6. Recommended Project Structure

project-root/

  books/                       # the fixed seven poker PDFs

  data/

    chroma_db/                 # persistent ChromaDB

  backend/

    app/

      api/

      models/                  # PostgreSQL models

      services/

        ingestion/

        retrieval/

        poker_state/

        opponent_profiles/

        llm/

    ingest_books.py

  frontend/

    astro + react application

  .env

7. Final End-to-End RAG Pipeline

Step

Behavior

1. Ingest once

Scan the books folder and read the seven fixed PDFs with PyMuPDF.

2. Clean

Remove extraction noise and normalize line breaks while preserving the original paragraph content.

3. Chunk

Create independent paragraph chunks with no overlap.

4. Embed

Generate local BGE-base embeddings for each paragraph.

5. Store

Persist embedding + original paragraph + book_name + chapter in the single poker_books ChromaDB collection.

6. User plays

The user manually enters table, stacks, cards, streets, actions, and bets through the UI.

7. Decision point

When it is the user’s turn, Python builds a simple poker situation summary.

8. Retrieve

Run vector similarity and BM25 against the books, combine results with 70/30 weighting, and select the top 5.

9. Build context

Create one context block containing the five retrieved paragraphs and their metadata.

10. Coach

Send current hand context + summarized opponent history + retrieved book context to Gemini.

11. Grounded response

Gemini produces one coach-style paragraph with a clear recommendation and source citation, without invented evidence.

12. Continue

The user separately enters their actual action; the application advances the hand state and repeats the process on the next user decision point.

13. Review

After the hand, use the completed hand context for a simple coaching review.

8. Scope Corrections / Clarifications

Some later questions repeated decisions that had already been settled. Those repetitions are consolidated here rather than treated as new requirements.

The book-ingestion workflow is intentionally simpler than a production system: the seven PDFs are fixed and are intended to be ingested once.

Page-level citations were explicitly dropped. The current metadata requirement is book_name + chapter.

No reranker, no retrieval-debug log, no automatic user-leak detection engine, and no sophisticated book versioning are in scope for the MVP.

The UI is a reference/rebuild target; the backend/RAG architecture is the main new work.

9. Reference Project

UI reference repository: https://github.com/DushyantBhardwaj2/Poker_AI

This document records the design decisions made in the conversation. It is intended as the implementation handoff for the project and as a concise explanation base for demonstrating the RAG architecture in a college project/interview.

