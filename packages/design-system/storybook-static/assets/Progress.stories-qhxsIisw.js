import{j as e}from"./jsx-runtime-CSjhXfFz.js";import"./index-BxY4JGwq.js";import{c as d}from"./clsx-B-dksMZM.js";import"./_commonjsHelpers-CqkleIqs.js";function a({value:i,max:m=100,label:r,showValue:c=!1,size:v="md",variant:g="primary",striped:x=!1,animated:h=!1,className:f,...V}){const p=Math.min(Math.max(i/m*100,0),100);return e.jsxs("div",{className:d("ds-progress",f),...V,children:[(r||c)&&e.jsxs("div",{className:"ds-progress__label",children:[r&&e.jsx("span",{className:"ds-progress__text",children:r}),c&&e.jsxs("span",{className:"ds-progress__value",children:[Math.round(p),"%"]})]}),e.jsx("div",{className:d("ds-progress__track",`ds-progress__track--${v}`),role:"progressbar","aria-valuenow":i,"aria-valuemin":0,"aria-valuemax":m,"aria-label":r||"Progress",children:e.jsx("div",{className:d("ds-progress__bar",`ds-progress__bar--${g}`,x&&"ds-progress__bar--striped",h&&"ds-progress__bar--animated"),style:{width:`${p}%`}})})]})}try{a.displayName="Progress",a.__docgenInfo={description:"",displayName:"Progress",props:{value:{defaultValue:null,description:"Valor atual (0-100)",name:"value",required:!0,type:{name:"number"}},max:{defaultValue:{value:"100"},description:"Valor máximo",name:"max",required:!1,type:{name:"number"}},label:{defaultValue:null,description:"Label do progresso",name:"label",required:!1,type:{name:"string"}},showValue:{defaultValue:{value:"false"},description:"Mostrar porcentagem",name:"showValue",required:!1,type:{name:"boolean"}},size:{defaultValue:{value:"md"},description:"Tamanho da barra",name:"size",required:!1,type:{name:"enum",value:[{value:'"sm"'},{value:'"md"'},{value:'"lg"'}]}},variant:{defaultValue:{value:"primary"},description:"Variante de cor",name:"variant",required:!1,type:{name:"enum",value:[{value:'"primary"'},{value:'"success"'},{value:'"warning"'},{value:'"error"'}]}},striped:{defaultValue:{value:"false"},description:"Listras",name:"striped",required:!1,type:{name:"boolean"}},animated:{defaultValue:{value:"false"},description:"Animar listras",name:"animated",required:!1,type:{name:"boolean"}}}}}catch{}const j={title:"Components/Progress",component:a,tags:["autodocs"],argTypes:{variant:{control:"select",options:["primary","success","warning","error"]},size:{control:"select",options:["sm","md","lg"]}}},s={args:{value:60,label:"Upload",showValue:!0}},l={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1.5rem",maxWidth:"400px"},children:[e.jsx(a,{value:60,variant:"primary",label:"Primary",showValue:!0}),e.jsx(a,{value:80,variant:"success",label:"Success",showValue:!0}),e.jsx(a,{value:40,variant:"warning",label:"Warning",showValue:!0}),e.jsx(a,{value:20,variant:"error",label:"Error",showValue:!0})]})},t={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1.5rem",maxWidth:"400px"},children:[e.jsx(a,{value:60,size:"sm",label:"Small",showValue:!0}),e.jsx(a,{value:60,size:"md",label:"Medium",showValue:!0}),e.jsx(a,{value:60,size:"lg",label:"Large",showValue:!0})]})},o={args:{value:65,striped:!0,label:"Striped",showValue:!0}},u={args:{value:65,striped:!0,animated:!0,label:"Animated",showValue:!0}},n={args:{value:100,variant:"success",label:"Complete",showValue:!0}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    value: 60,
    label: 'Upload',
    showValue: true
  }
}`,...s.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    maxWidth: '400px'
  }}>\r
      <Progress value={60} variant="primary" label="Primary" showValue />\r
      <Progress value={80} variant="success" label="Success" showValue />\r
      <Progress value={40} variant="warning" label="Warning" showValue />\r
      <Progress value={20} variant="error" label="Error" showValue />\r
    </div>
}`,...l.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    maxWidth: '400px'
  }}>\r
      <Progress value={60} size="sm" label="Small" showValue />\r
      <Progress value={60} size="md" label="Medium" showValue />\r
      <Progress value={60} size="lg" label="Large" showValue />\r
    </div>
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    value: 65,
    striped: true,
    label: 'Striped',
    showValue: true
  }
}`,...o.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    value: 65,
    striped: true,
    animated: true,
    label: 'Animated',
    showValue: true
  }
}`,...u.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    value: 100,
    variant: 'success',
    label: 'Complete',
    showValue: true
  }
}`,...n.parameters?.docs?.source}}};const P=["Default","Variants","Sizes","Striped","Animated","FullProgress"];export{u as Animated,s as Default,n as FullProgress,t as Sizes,o as Striped,l as Variants,P as __namedExportsOrder,j as default};
