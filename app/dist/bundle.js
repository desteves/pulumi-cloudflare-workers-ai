var H=Object.getPrototypeOf(Uint8Array);function C(t){return Array.isArray(t)||t instanceof H}function U(t){return t instanceof H?t.length:t.flat(1/0).reduce((e,s)=>e+(s instanceof H?s.length:1),0)}function W(t,e){if(t.length===0&&!C(e))return;let s=t.reduce((n,a)=>{if(!Number.isInteger(a))throw new Error(`expected shape to be array-like of integers but found non-integer element "${a}"`);return n*a},1);if(s!=U(e))throw new Error(`invalid shape: expected ${s} elements for shape ${t} but value array has length ${e.length}`)}function M(t,e){if(C(e)){e.forEach(s=>M(t,s));return}switch(t){case"bool":{if(typeof e=="boolean")return;break}case"float16":case"float32":{if(typeof e=="number")return;break}case"int8":case"uint8":case"int16":case"uint16":case"int32":case"uint32":{if(Number.isInteger(e))return;break}case"int64":case"uint64":{if(typeof e=="bigint")return;break}case"str":{if(typeof e=="string")return;break}}throw new Error(`unexpected type "${t}" with value "${e}".`)}function G(t,e){if(C(e))return[...e].map(s=>G(t,s));switch(t){case"str":case"bool":case"float16":case"float32":case"int8":case"uint8":case"int16":case"uint16":case"uint32":case"int32":return e;case"int64":case"uint64":return e.toString()}throw new Error(`unexpected type "${t}" with value "${e}".`)}function w(t,e){if(C(e))return e.map(s=>w(t,s));switch(t){case"str":case"bool":case"float16":case"float32":case"int8":case"uint8":case"int16":case"uint16":case"uint32":case"int32":return e;case"int64":case"uint64":return BigInt(e)}throw new Error(`unexpected type "${t}" with value "${e}".`)}var b=class D{type;value;name;shape;constructor(e,s,n={}){this.type=e,this.value=s,M(e,this.value),n.shape===void 0?C(this.value)?this.shape=[U(s)]:this.shape=[]:this.shape=n.shape,W(this.shape,this.value),this.name=n.name||null}static fromJSON(e){let{type:s,shape:n,value:a,b64Value:E,name:S}=e,I={shape:n,name:S};if(E!==void 0){let g=v(E,s)[0];return new D(s,g,I)}else return new D(s,w(s,a),I)}toJSON(){return{type:this.type,shape:this.shape,name:this.name,value:G(this.type,this.value)}}};function v(t,e){let s=atob(t),n=new Uint8Array(s.length);for(let E=0;E<s.length;E++)n[E]=s.charCodeAt(E);let a=new DataView(n.buffer).buffer;switch(e){case"float32":return new Float32Array(a);case"float64":return new Float64Array(a);case"int32":return new Int32Array(a);case"int64":return new BigInt64Array(a);default:throw Error(`invalid data type for base64 input: ${e}`)}}var i="A chat between a curious human and an artificial intelligence assistant. The assistant gives helpful, detailed, and polite answers to the human's questions.",B="Write code to solve the following coding problem that obeys the constraints and passes the example test cases. Please wrap your code answer using   ```:",k=t=>{let e=[new b("str",[t.prompt],{shape:[1],name:"text_input"}),new b("str",[`{"max_tokens": ${t.max_tokens}}`],{shape:[1],name:"sampling_parameters"})];return t.stream&&e.push(new b("bool",!0,{name:"stream"})),e},y=(t,e)=>{let s=t.generated_text.value[0];if(e)for(var n in e)s=s.replace(e[n],"");return s},l={type:"vllm",inputsDefaultsStream:{max_tokens:512},inputsDefaults:{max_tokens:512},preProcessingArgs:{promptTemplate:"bare",defaultContext:""},generateTensorsFunc:t=>k(t),postProcessingFunc:(t,e)=>t.name.value[0].slice(e.prompt.length),postProcessingFuncStream:(t,e,s)=>{let n=t.name.value[0],a=s(n.length),E=a-n.length;if(!(a<e.prompt.length))return E>=e.prompt.length?n:n.slice(e.prompt.length-E)}},O=(t,e,s)=>({type:"tgi",inputsDefaultsStream:{max_tokens:512},inputsDefaults:{max_tokens:256},preProcessingArgs:{promptTemplate:t,defaultContext:e},postProcessingFunc:(n,a)=>y(n,s),postProcessingFuncStream:(n,a,E)=>y(n,s)});var j={"@hf/thebloke/deepseek-coder-6.7b-instruct-awq":O("deepseek",B,["<|EOT|>"]),"@hf/thebloke/deepseek-coder-6.7b-base-awq":O("bare",B),"@hf/thebloke/llamaguard-7b-awq":O("inst",i),"@hf/thebloke/openchat_3.5-awq":{...O("openchat",i),experimental:!0},"@hf/thebloke/openhermes-2.5-mistral-7b-awq":O("chatml",i,["<|im_end|>"]),"@hf/thebloke/starling-lm-7b-alpha-awq":{...O("openchat",i,["<|end_of_turn|>"]),experimental:!0},"@hf/thebloke/orca-2-13b-awq":{...O("chatml",i),experimental:!0},"@hf/thebloke/neural-chat-7b-v3-1-awq":O("orca-hashes",i),"@hf/thebloke/llama-2-13b-chat-awq":O("llama2",i),"@hf/thebloke/zephyr-7b-beta-awq":O("zephyr",i),"@hf/thebloke/mistral-7b-instruct-v0.1-awq":O("mistral-instruct",i),"@hf/thebloke/codellama-7b-instruct-awq":O("llama2",B),"@cf/thebloke/yarn-mistral-7b-64k-awq":{...l,experimental:!0},"@cf/microsoft/phi-2":l,"@cf/defog/sqlcoder-7b-2":{...l,preProcessingArgs:{promptTemplate:"sqlcoder",defaultContext:i}},"@cf/deepseek-ai/deepseek-math-7b-base":l,"@cf/deepseek-ai/deepseek-math-7b-instruct":l,"@cf/tiiuae/falcon-7b-instruct":{...l,preProcessingArgs:{promptTemplate:"falcon",defaultContext:i}},"@cf/thebloke/discolm-german-7b-v1-awq":{...l,preProcessingArgs:{promptTemplate:"chatml",defaultContext:i}},"@cf/qwen/qwen1.5-14b-chat-awq":{...l,preProcessingArgs:{promptTemplate:"chatml",defaultContext:i}},"@cf/qwen/qwen1.5-0.5b-chat":{...l,preProcessingArgs:{promptTemplate:"chatml",defaultContext:i}},"@cf/qwen/qwen1.5-1.8b-chat":{...l,preProcessingArgs:{promptTemplate:"chatml",defaultContext:i}},"@cf/qwen/qwen1.5-7b-chat-awq":{...l,preProcessingArgs:{promptTemplate:"chatml",defaultContext:i}},"@cf/tinyllama/tinyllama-1.1b-chat-v1.0":{...l,preProcessingArgs:{promptTemplate:"tinyllama",defaultContext:i}},"@cf/openchat/openchat-3.5-0106":{...l,preProcessingArgs:{promptTemplate:"openchat-alt",defaultContext:i}},"@cf/unum/uform-gen2-qwen-500m":{postProcessingFunc:(t,e)=>t.name.value[0].replace("<|im_end|>","")},"@cf/jpmorganchase/roberta-spam":{experimental:!0},"@hf/sentence-transformers/all-minilm-l6-v2":{experimental:!0},"@hf/baai/bge-base-en-v1.5":{postProcessingFunc:(t,e)=>({shape:t.data.shape,data:t.data.value})},"@cf/meta/llama-2-7b-chat-fp16":{inputsDefaultsStream:{max_tokens:2500},inputsDefaults:{max_tokens:256},preProcessingArgs:{promptTemplate:"llama2",defaultContext:i}},"@cf/meta/llama-2-7b-chat-int8":{inputsDefaultsStream:{max_tokens:1800},inputsDefaults:{max_tokens:256},preProcessingArgs:{promptTemplate:"llama2",defaultContext:i}},"@cf/openai/whisper":{postProcessingFunc:(t,e)=>t.word_count?{text:t.name.value.join("").trim(),word_count:parseInt(t.word_count.value),words:t.name.value.map((s,n)=>({word:s.trim(),start:t.timestamps.value[0][n][0],end:t.timestamps.value[0][n][1]}))}:{text:t.name.value.join("").trim()}},"@cf/mistral/mistral-7b-instruct-v0.1":{inputsDefaultsStream:{max_tokens:1800},inputsDefaults:{max_tokens:256},preProcessingArgs:{promptTemplate:"mistral-instruct",defaultContext:i}}};var V=class extends TransformStream{constructor(){let t;super({start(e){t=Y(s=>{s.type==="event"&&e.enqueue(s)})},transform(e){t.feed(e)}})}},F=[239,187,191];function _(t){return F.every((e,s)=>t.charCodeAt(s)===e)}function Y(t){let e,s,n,a,E,S,I;return g(),{feed:d,reset:g};function g(){e=!0,s="",n=0,a=-1,E=void 0,S=void 0,I=""}function d(L){s=s?s+L:L,e&&_(s)&&(s=s.slice(F.length)),e=!1;let u=s.length,o=0,N=!1;for(;o<u;){N&&(s[o]===`
`&&++o,N=!1);let T=-1,m=a,c;for(let r=n;T<0&&r<u;++r)c=s[r],c===":"&&m<0?m=r-o:c==="\r"?(N=!0,T=r-o):c===`
`&&(T=r-o);if(T<0){n=u-o,a=m;break}else n=0,a=-1;P(s,o,m,T),o+=T+1}o===u?s="":o>0&&(s=s.slice(o))}function P(L,u,o,N){if(N===0){I.length>0&&(t({type:"event",id:E,event:S||void 0,data:I.slice(0,-1)}),I="",E=void 0),S=void 0;return}let T=o<0,m=L.slice(u,u+(T?N:o)),c=0;T?c=N:L[u+o+1]===" "?c=o+2:c=o+1;let r=u+c,A=N-c,p=L.slice(r,r+A).toString();if(m==="data")I+=p?`${p}
`:`
`;else if(m==="event")S=p;else if(m==="id"&&!p.includes("\0"))E=p;else if(m==="retry"){let R=parseInt(p,10);Number.isNaN(R)||t({type:"reconnect-interval",value:R})}}}var J=class extends TransformStream{constructor(){super({transform(t,e){if(t.data!=="[DONE]")try{let s=JSON.parse(t.data);e.enqueue(s)}catch(s){console.error(`failed to parse incoming data (${s.stack}): ${t.data}`);return}}})}};var K=`<!DOCTYPE html>
<html>

<head>
    <title> Workers AI Text-to-Image Sample App using Pulumi </title>
    <style>
        body {
            text-align: center;
            /* Center align the text and inline elements */
        }

        .image-container {
            position: relative;
            margin: 0 auto;
            width: 1024px;
            /* Set your desired container width */
            height: 1024px;
            /* Set your desired container height */
        }

        .overlay-image {
            position: absolute;
            width: 50%;
            top: 50%;
            /* Centered from the top */
            left: 50%;
            /* Centered from the left */
            transform: translate(-50%, -50%);
            /* Center the image */
            z-index: 1;
            /* This image will be on top */
        }

        .base-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 80%;
            height: 80%;
            z-index: 0;
            /* This image will be behind the overlay image */
        }
    </style>
</head>

<body>
    <h1> Cloudflare Workers AI + Pulumi Demo </h1>
    <div class="image-container">
        <img class="overlay-image" src="" alt="Marguee Sign">
        <img class="base-image" src="" alt="AI Image">
    </div>
</body>

</html>`;var se={async fetch(t,e,s){let E=Math.floor(Math.random()*19)+2,S=await e.KV_NAMESPACE_BINDING.get(E.toString()),I=S.length>35?"32":"64",d="https://textoverimage.moesif.com/image?image_url="+"https%3A%2F%2Fi.imgur.com%2FCypWQYk.jpg"+"&text="+encodeURIComponent(S)+"&text_color=050505ff&text_size="+I+"&margin=37&y_align=middle&x_align=bottom";function P(r){let A="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",p="",R=0,f=r.length%3,x=r.length-f;for(;R<x;R+=3){let h=(r.charCodeAt(R)<<16)+(r.charCodeAt(R+1)<<8)+r.charCodeAt(R+2);p+=A[h>>18&63]+A[h>>12&63]+A[h>>6&63]+A[h&63]}if(f){let h=r.charCodeAt(R)<<16;f===2&&(h+=r.charCodeAt(R+1)<<8),p+=A[h>>18&63]+A[h>>12&63],p+=f===2?A[h>>6&63]:"=",p+="="}return p}function L(r){let A="";for(let R=0;R<r.length;R++)A+=String.fromCharCode(r[R]);return P(A)}let u="https://gateway.ai.cloudflare.com/v1/"+e.CF_ACCT_ID+"/ai/workers-ai/"+e.T2IMODEL,o={method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+e.CF_ACCT_TOKEN},body:JSON.stringify({prompt:S,num_steps:1})},T=await(await fetch(u,o)).arrayBuffer(),m="data:image/png;base64,"+L(new Uint8Array(T));class c{element(A){A.getAttribute("class")=="overlay-image"?A.setAttribute("src",d):A.getAttribute("class")=="base-image"&&A.setAttribute("src",m)}}return new HTMLRewriter().on("img",new c).transform(new Response(K,{status:200,headers:{"content-type":"text/html;charset=UTF-8","Cache-Control":"s-maxage=0"}}))}};export{se as default};
