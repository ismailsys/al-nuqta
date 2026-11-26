# SAKINA — sources and data licensing

## 1. Arabic Quran text: Tanzil
- Official source: https://tanzil.net
- Download page: https://tanzil.net/download/
- Version currently documented on the download page: Quran Text 1.1.
- Tanzil allows verbatim redistribution in a website or application when the source is clearly credited and linked.
- The Quran text must not be changed. Preserve the downloaded source file and its required copyright/licence notice exactly.
- Any normalized search representation must be stored as a separate technical index, never substituted for the original displayed Quran text. Keep a traceable link to the original verse key.

## 2. Morphology: Quranic Arabic Corpus
- Official source: https://corpus.quran.com
- Data download: https://corpus.quran.com/download/
- The corpus documents morphology, syntax and a semantic ontology.
- Its downloadable version 0.4 is published under the GNU GPL and its terms prohibit changing the annotation file. It also requires attribution and a link to the corpus.
- Decision for SAKINA: use it initially as a linguistic reference for auditing roots and lemmas. Do not bundle its annotation data into the production application until the exact GPL obligations and compatibility with the application's distribution model have been reviewed.

## 3. Content and search API: Quran Foundation
- Official API documentation: https://api-docs.quran.foundation
- Search documentation: https://api-docs.quran.foundation/docs/search_apis_versioned/1.0.0/search-controller-search/
- Content API quickstart: https://api-docs.quran.com/docs/quickstart/
- The current documented API uses OAuth2 credentials. Requests requiring a client secret must be made from the backend, never directly from browser code.
- Decision for SAKINA: evaluate it for translations, tafsir and recitations only after confirming available content, permissions, quotas and licence terms. The local corpus/index remains the stable search foundation.

## 4. Translation and tafsir
No translation or tafsir should be copied into SAKINA until the publisher, edition, usage rights and attribution requirements are recorded. Do not use browser auto-translation to generate Quran translations. A model-generated paraphrase must never be labelled as a published translation or tafsir.

## 5. Provenance fields required for every dataset
- source_name
- source_url
- source_version
- retrieved_at
- licence
- attribution_text
- source_checksum
- verse_key (chapter:verse), where applicable
- transformation_notes (only for search/index derivatives)

## 6. Release gate
Before production:
1. Confirm 114 surahs and 6,236 verse records, with exact verse-key continuity.
2. Compare the displayed Arabic text against the unmodified source.
3. Validate every morphology/root record against its licensed source.
4. Confirm translation and tafsir licences.
5. Keep original source data immutable and separate from normalized indexes.
