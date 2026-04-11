import{j as e}from"./jsx-runtime-CSjhXfFz.js";import{r}from"./index-BxY4JGwq.js";import{c as f}from"./clsx-B-dksMZM.js";import"./_commonjsHelpers-CqkleIqs.js";function t({checked:o,onChange:a,label:s,size:m="md",disabled:n=!1,className:g,...h}){const p=r.useId();return e.jsxs("label",{className:f("ds-toggle",n&&"ds-toggle--disabled",g),htmlFor:p,...h,children:[e.jsx("input",{id:p,type:"checkbox",className:"ds-toggle__input",role:"switch",checked:o,onChange:k=>!n&&a(k.target.checked),disabled:n,"aria-checked":o}),e.jsx("span",{className:f("ds-toggle__track",`ds-toggle__track--${m}`,o&&"ds-toggle__track--checked"),children:e.jsx("span",{className:"ds-toggle__thumb"})}),s&&e.jsx("span",{className:"ds-toggle__label",children:s})]})}try{t.displayName="Toggle",t.__docgenInfo={description:"",displayName:"Toggle",props:{checked:{defaultValue:null,description:"Estado do toggle",name:"checked",required:!0,type:{name:"boolean"}},onChange:{defaultValue:null,description:"Callback ao mudar",name:"onChange",required:!0,type:{name:"(checked: boolean) => void"}},label:{defaultValue:null,description:"Label do toggle",name:"label",required:!1,type:{name:"string"}},size:{defaultValue:{value:"md"},description:"Tamanho",name:"size",required:!1,type:{name:"enum",value:[{value:'"sm"'},{value:'"md"'},{value:'"lg"'}]}},disabled:{defaultValue:{value:"false"},description:"Desabilitado",name:"disabled",required:!1,type:{name:"boolean"}}}}}catch{}const _={title:"Components/Toggle",component:t,tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","md","lg"]}}},c={render:function(){const[a,s]=r.useState(!1);return e.jsx(t,{checked:a,onChange:s,label:"Dark mode"})}},l={render:function(){const[a,s]=r.useState(!0);return e.jsx(t,{checked:a,onChange:s,label:"Notifications"})}},d={args:{checked:!1,onChange:()=>{},label:"Disabled",disabled:!0}},i={render:function(){const[a,s]=r.useState(!1),[m,n]=r.useState(!0),[g,h]=r.useState(!1);return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1rem"},children:[e.jsx(t,{checked:a,onChange:s,size:"sm",label:"Small"}),e.jsx(t,{checked:m,onChange:n,size:"md",label:"Medium"}),e.jsx(t,{checked:g,onChange:h,size:"lg",label:"Large"})]})}},u={render:function(){const[a,s]=r.useState(!1);return e.jsx(t,{checked:a,onChange:s})}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: function Demo() {
    const [checked, setChecked] = useState(false);
    return <Toggle checked={checked} onChange={setChecked} label="Dark mode" />;
  }
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: function Demo() {
    const [checked, setChecked] = useState(true);
    return <Toggle checked={checked} onChange={setChecked} label="Notifications" />;
  }
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    checked: false,
    onChange: () => {},
    label: 'Disabled',
    disabled: true
  }
}`,...d.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: function Demo() {
    const [sm, setSm] = useState(false);
    const [md, setMd] = useState(true);
    const [lg, setLg] = useState(false);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>\r
        <Toggle checked={sm} onChange={setSm} size="sm" label="Small" />\r
        <Toggle checked={md} onChange={setMd} size="md" label="Medium" />\r
        <Toggle checked={lg} onChange={setLg} size="lg" label="Large" />\r
      </div>;
  }
}`,...i.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: function Demo() {
    const [checked, setChecked] = useState(false);
    return <Toggle checked={checked} onChange={setChecked} />;
  }
}`,...u.parameters?.docs?.source}}};const D=["Default","Checked","Disabled","AllSizes","WithoutLabel"];export{i as AllSizes,l as Checked,c as Default,d as Disabled,u as WithoutLabel,D as __namedExportsOrder,_ as default};
