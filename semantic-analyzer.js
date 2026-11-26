(function(){
  "use strict";
  const lexiconUrl = "/data/quran-concept-lexicon.v1.json";
  const selectedMap = {
    protection:"protection",
    marriage:"marriage_relationship",
    rizq:"work_career",
    children:"children_parenting",
    calm:"tranquility"
  };
  const domainLabels = {
    physical:"الجوانب الجسدية",
    emotional:"المشاعر والحالة النفسية",
    personal:"العلاقات والحياة الشخصية",
    material:"العمل والظروف المادية",
    spiritual:"الجوانب الروحية",
    life_circumstances:"الظروف والتحديات الشخصية"
  };
  let lexiconPromise;
  function normalize(value){
    return (value||"").toString().toLowerCase().normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .replace(/[\u064b-\u065f\u0670]/g,"")
      .replace(/ـ/g,"").replace(/[أإآٱ]/g,"ا")
      .replace(/ى/g,"ي").replace(/ة/g,"ه")
      .replace(/[^\p{L}\p{N}\s]/gu," ")
      .replace(/\s+/g," ").trim();
  }
  async function loadLexicon(){
    if(!lexiconPromise){
      lexiconPromise=fetch(lexiconUrl,{cache:"no-cache"})
        .then(r=>{if(!r.ok)throw new Error("Lexicon unavailable");return r.json();})
        .catch(err=>{console.warn("SAKINA lexicon:",err);return {concepts:[]};});
    }
    return lexiconPromise;
  }
  function matchesAlias(text,alias){
    const term=normalize(alias);
    if(!term || term.length<2) return false;
    if(term.includes(" ")) return (" "+text+" ").includes(" "+term+" ");
    const tokens=text.split(" ");
    return tokens.some(token=>token===term || (term.length>=5 && token.startsWith(term)) ||
      (/^[\u0600-\u06ff]+$/u.test(term) && term.length>=3 && token.startsWith(term)));
  }
  async function analyze(description,selectedCategories=[]){
    const data=await loadLexicon();
    const normalized=normalize(description);
    const found=[];
    for(const concept of (data.concepts||[])){
      const aliases=Object.values(concept.aliases||{}).flat();
      const matched=aliases.filter(alias=>matchesAlias(normalized,alias));
      if(matched.length){
        found.push({
          id:concept.id,domain:concept.domain,label:concept.label_ar||concept.label_fr,
          labelFr:concept.label_fr,matchedTerms:[...new Set(matched)].slice(0,4),
          searchTerms:concept.search_candidates_ar||[],selected:false,
          confidence:Math.min(0.98,0.68+matched.length*0.08)
        });
      }
    }
    for(const category of selectedCategories){
      const id=selectedMap[category];
      if(id && !found.some(c=>c.id===id)){
        const concept=(data.concepts||[]).find(c=>c.id===id);
        if(concept) found.push({
          id:concept.id,domain:concept.domain,label:concept.label_ar||concept.label_fr,
          labelFr:concept.label_fr,matchedTerms:[],searchTerms:concept.search_candidates_ar||[],
          selected:true,confidence:1
        });
      }
    }
    const dimensions=[...new Set(found.map(c=>c.domain))]
      .map(id=>({id,label:domainLabels[id]||id,concepts:found.filter(c=>c.domain===id)}));
    const terms=[];
    const queues=found.map(concept=>({
      concept,
      terms:concept.searchTerms.slice(0,4)
    }));
    for(let round=0;round<4;round++){
      for(const queue of queues){
        const term=queue.terms[round];
        if(!term)continue;
        const normalizedTerm=normalize(term);
        const existing=terms.find(t=>normalize(t.term)===normalizedTerm);
        if(!existing){
          terms.push({term,conceptId:queue.concept.id,conceptIds:[queue.concept.id],domain:queue.concept.domain,label:queue.concept.label,priority:queue.concept.confidence});
        }else if(!existing.conceptIds.includes(queue.concept.id)){
          existing.conceptIds.push(queue.concept.id);
        }
      }
    }
    const arabicWords=(description.match(/[\u0600-\u06FF]{3,}/g)||[]);
    for(const word of arabicWords){
      if(!terms.some(t=>normalize(t.term)===normalize(word))){
        terms.unshift({term:word,conceptId:null,conceptIds:[],domain:"user_words",label:"لفظ من وصفك",priority:1.2});
      }
    }
    return {
      original:description,
      concepts:found,
      dimensions,
      searchTerms:terms.slice(0,20),
      summary:found.map(c=>c.label),
      hasDetectedConcepts:found.length>0,
      source:"local_semantic_lexicon",
      disclaimer:"هذا تحليل لغوي أولي للوصف، وليس تشخيصاً طبياً أو حكماً على حالة الشخص."
    };
  }
  window.SakinaAnalyzer={analyze,normalize,domainLabels};
})();