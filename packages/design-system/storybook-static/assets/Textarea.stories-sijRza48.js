import{j as e}from"./jsx-runtime-CSjhXfFz.js";import{r as _}from"./index-BxY4JGwq.js";import{c as d}from"./clsx-B-dksMZM.js";import"./_commonjsHelpers-CqkleIqs.js";const a=_.forwardRef(({label:l,helperText:s,error:o,size:i="md",fullWidth:y=!0,noResize:v=!1,maxLength:t,showCount:T=!1,className:z,id:r,value:g,...j},S)=>{const n=!!o,b=typeof g=="string"?g.length:0,C=t?b>t:!1;return e.jsxs("div",{className:d("ds-textarea-wrapper",y&&"ds-textarea-wrapper--full",z),children:[l&&e.jsx("label",{htmlFor:r,className:"ds-textarea__label",children:l}),e.jsx("div",{className:d("ds-textarea__container",n&&"ds-textarea__container--error"),children:e.jsx("textarea",{ref:S,id:r,className:d("ds-textarea__field",i!=="md"&&`ds-textarea__field--${i}`,v&&"ds-textarea__field--no-resize"),"aria-invalid":n||void 0,"aria-describedby":n?`${r}-error`:s?`${r}-helper`:void 0,maxLength:t,value:g,...j})}),n?e.jsx("span",{id:`${r}-error`,className:"ds-textarea__error",role:"alert",children:o}):s?e.jsx("span",{id:`${r}-helper`,className:"ds-textarea__helper",children:s}):null,T&&e.jsxs("span",{className:d("ds-textarea__counter",C&&"ds-textarea__counter--over"),children:[b,t?`/${t}`:""]})]})});a.displayName="Textarea";try{a.displayName="Textarea",a.__docgenInfo={description:"",displayName:"Textarea",props:{label:{defaultValue:null,description:"Label",name:"label",required:!1,type:{name:"string"}},helperText:{defaultValue:null,description:"Texto de ajuda",name:"helperText",required:!1,type:{name:"string"}},error:{defaultValue:null,description:"Mensagem de erro",name:"error",required:!1,type:{name:"string"}},size:{defaultValue:{value:"md"},description:"Tamanho",name:"size",required:!1,type:{name:"enum",value:[{value:'"sm"'},{value:'"md"'},{value:'"lg"'}]}},fullWidth:{defaultValue:{value:"true"},description:"Largura total",name:"fullWidth",required:!1,type:{name:"boolean"}},noResize:{defaultValue:{value:"false"},description:"Desabilitar resize",name:"noResize",required:!1,type:{name:"boolean"}},maxLength:{defaultValue:null,description:"Limite de caracteres",name:"maxLength",required:!1,type:{name:"number"}},showCount:{defaultValue:{value:"false"},description:"Mostrar contador",name:"showCount",required:!1,type:{name:"boolean"}}}}}catch{}const q={title:"Components/Textarea",component:a,tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","md","lg"]}}},c={args:{id:"ta1",label:"Description",placeholder:"Enter a description..."}},u={args:{id:"ta2",label:"Bio",helperText:"Brief description about yourself",placeholder:"Tell us about you..."}},m={args:{id:"ta3",label:"Comment",error:"This field is required",placeholder:"Write a comment..."}},p={render:function(){const[s,o]=_.useState("");return e.jsx(a,{id:"ta4",label:"Message",showCount:!0,maxLength:200,value:s,onChange:i=>o(i.target.value),placeholder:"Type your message..."})}},x={args:{id:"ta5",label:"Fixed size",noResize:!0,placeholder:"Cannot resize this..."}},h={args:{id:"ta6",label:"Disabled",disabled:!0,value:"This field is disabled"}},f={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1.5rem",maxWidth:"400px"},children:[e.jsx(a,{id:"sm",size:"sm",label:"Small",placeholder:"Small textarea"}),e.jsx(a,{id:"md",size:"md",label:"Medium",placeholder:"Medium textarea"}),e.jsx(a,{id:"lg",size:"lg",label:"Large",placeholder:"Large textarea"})]})};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    id: 'ta1',
    label: 'Description',
    placeholder: 'Enter a description...'
  }
}`,...c.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    id: 'ta2',
    label: 'Bio',
    helperText: 'Brief description about yourself',
    placeholder: 'Tell us about you...'
  }
}`,...u.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    id: 'ta3',
    label: 'Comment',
    error: 'This field is required',
    placeholder: 'Write a comment...'
  }
}`,...m.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: function Demo() {
    const [val, setVal] = useState('');
    return <Textarea id="ta4" label="Message" showCount maxLength={200} value={val} onChange={e => setVal(e.target.value)} placeholder="Type your message..." />;
  }
}`,...p.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    id: 'ta5',
    label: 'Fixed size',
    noResize: true,
    placeholder: 'Cannot resize this...'
  }
}`,...x.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    id: 'ta6',
    label: 'Disabled',
    disabled: true,
    value: 'This field is disabled'
  }
}`,...h.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    maxWidth: '400px'
  }}>\r
      <Textarea id="sm" size="sm" label="Small" placeholder="Small textarea" />\r
      <Textarea id="md" size="md" label="Medium" placeholder="Medium textarea" />\r
      <Textarea id="lg" size="lg" label="Large" placeholder="Large textarea" />\r
    </div>
}`,...f.parameters?.docs?.source}}};const E=["Default","WithHelperText","WithError","WithCounter","NoResize","Disabled","Sizes"];export{c as Default,h as Disabled,x as NoResize,f as Sizes,p as WithCounter,m as WithError,u as WithHelperText,E as __namedExportsOrder,q as default};
