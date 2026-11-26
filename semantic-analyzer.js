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
  function arabicTokenVariants(token){
    const variants=new Set([token]);
    const add=value=>{if(value&&value.length>=3)variants.add(value);};
    for(const prefix of ["وال","فال","بال","كال","ولل","لل","و","ف","ب","ك","ل"]){
      if(token.startsWith(prefix)&&token.length-prefix.length>=3)add(token.slice(prefix.length));
    }
    for(const value of [...variants]){
      if(value.startsWith("ال")&&value.length>=5)add(value.slice(2));
      for(const suffix of ["كما","هما","هم","هن","كم","كن","نا","ها","هم","ه","ي","ك"]){
        if(value.endsWith(suffix)&&value.length-suffix.length>=3)add(value.slice(0,-suffix.length));
      }
    }
    return [...variants];
  }
  function matchesAlias(text,alias){
    const term=normalize(alias);
    if(!term || term.length<2) return false;
    if(term.includes(" ")) return (" "+text+" ").includes(" "+term+" ");
    const tokens=text.split(" ");
    const arabic=/^[\u0600-\u06ff]+$/u.test(term);
    return tokens.some(token=>{
      const candidates=arabic?arabicTokenVariants(token):[token];
      return candidates.some(candidate=>candidate===term ||
        (!arabic&&term.length>=5&&candidate.startsWith(term)));
    });
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
    const ids=new Set(found.map(c=>c.id));
    const relations=[];
    const addRelation=(id,label,description,required)=>{
      if(required.every(group=>group.some(conceptId=>ids.has(conceptId)))){
        relations.push({id,label,description,concepts:required.flat().filter(conceptId=>ids.has(conceptId))});
      }
    };
    addRelation("physical_emotional","تزامن الجانب الجسدي والمشاعر",
      "ذكرت في وصفك جانباً جسدياً وجانباً شعورياً معاً. نعرضهما كمحورين متزامنين دون افتراض أن أحدهما سبب الآخر.",
      [["pain","migraine_headache","illness","fatigue","stomach_abdomen","headache","heart_chest","back_bones","kidneys","liver","lungs","legs"],["anxiety_distress","fear","sadness_grief","anger"]]);
    addRelation("financial_emotional","الظروف المادية والمشاعر",
      "وردت في وصفك مسألة مادية إلى جانب شعور أو قلق. سنبحث في كل محور ثم في مواضع تجمع بينهما.",
      [["money_debt","work_career"],["anxiety_distress","fear","sadness_grief"]]);
    addRelation("family_emotional","العلاقات والمشاعر",
      "وردت علاقة شخصية مع شعور عاطفي في الوصف. هذا تزامن في الموضوعات وليس حكماً على العلاقة أو سبب المشكلة.",
      [["family_relationships","marriage_relationship","marital_conflict","children_parenting"],["anxiety_distress","fear","sadness_grief","anger","loneliness"]]);
    addRelation("sleep_fatigue","النوم والتعب",
      "ذكرت النوم والتعب معاً؛ يمكن قراءة المواضع المتعلقة بالليل والراحة والمشقة كلٌّ في سياقه.",
      [["sleep"],["fatigue","fatigue_exhaustion"]]);
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
    const arabicStopWords=new Set(["عندي","اريد","عندما","هناك","هذا","هذه","ذلك","التي","الذي","الذين","اللواتي","على","الى","من","عن","مع","بعد","قبل","كان","كانت","يكون","تكون","ليس","لدي","لديك","كلما","بسبب","جدا","كثير","كثيرة","شيء","اشعر","احس","حالتي","مشكلتي","مشاكل","مشكلة","عند","في","فوق","تحت","لكن","حتى","اذا","إن","ان"].map(normalize));
    const arabicWords=(description.match(/[\u0600-\u06FF]{3,}/g)||[]);
    for(const rawWord of arabicWords){
      const word=normalize(rawWord);
      if(word.length<3||arabicStopWords.has(word))continue;
      if(/^[وفبكل]/u.test(word)&&word.length>=4)continue;
      if(!terms.some(t=>normalize(t.term)===word)){
        terms.unshift({term:word,conceptId:null,conceptIds:[],domain:"user_words",label:"لفظ عربي من وصفك",priority:1.2});
      }
    }
    return {
      original:description,
      concepts:found,
      dimensions,
      relations,
      searchTerms:terms.slice(0,20),
      summary:found.map(c=>c.label),
      hasDetectedConcepts:found.length>0,
      source:"local_semantic_lexicon",
      disclaimer:"هذا تحليل لغوي أولي للوصف، وليس تشخيصاً طبياً أو حكماً على حالة الشخص."
    };
  }
  window.SakinaAnalyzer={analyze,normalize,domainLabels};
})();