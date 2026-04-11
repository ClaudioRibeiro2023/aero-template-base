import{j as e}from"./jsx-runtime-CSjhXfFz.js";import{r as j}from"./index-BxY4JGwq.js";import{c as x}from"./clsx-B-dksMZM.js";import"./_commonjsHelpers-CqkleIqs.js";const a=j.forwardRef(({label:p,helperText:m,error:b,size:g="md",fullWidth:y=!0,options:f,placeholder:h,className:v,id:s,..._},S)=>{const l=!!b;return e.jsxs("div",{className:x("ds-select-wrapper",y&&"ds-select-wrapper--full",v),children:[p&&e.jsx("label",{htmlFor:s,className:"ds-select__label",children:p}),e.jsx("div",{className:x("ds-select__container",l&&"ds-select__container--error",g!=="md"&&`ds-select__container--${g}`),children:e.jsxs("select",{ref:S,id:s,className:"ds-select__field","aria-invalid":l||void 0,"aria-describedby":l?`${s}-error`:m?`${s}-helper`:void 0,..._,children:[h&&e.jsx("option",{value:"",disabled:!0,children:h}),f.map(o=>e.jsx("option",{value:o.value,disabled:o.disabled,children:o.label},o.value))]})}),l?e.jsx("span",{id:`${s}-error`,className:"ds-select__error",role:"alert",children:b}):m?e.jsx("span",{id:`${s}-helper`,className:"ds-select__helper",children:m}):null]})});a.displayName="Select";try{a.displayName="Select",a.__docgenInfo={description:"",displayName:"Select",props:{label:{defaultValue:null,description:"Label",name:"label",required:!1,type:{name:"string"}},helperText:{defaultValue:null,description:"Texto de ajuda",name:"helperText",required:!1,type:{name:"string"}},error:{defaultValue:null,description:"Mensagem de erro",name:"error",required:!1,type:{name:"string"}},size:{defaultValue:{value:"md"},description:"Tamanho",name:"size",required:!1,type:{name:"enum",value:[{value:'"sm"'},{value:'"md"'},{value:'"lg"'}]}},fullWidth:{defaultValue:{value:"true"},description:"Largura total",name:"fullWidth",required:!1,type:{name:"boolean"}},options:{defaultValue:null,description:"Opções",name:"options",required:!0,type:{name:"SelectOption[]"}},placeholder:{defaultValue:null,description:"Placeholder",name:"placeholder",required:!1,type:{name:"string"}}}}}catch{}const r=[{value:"br",label:"Brazil"},{value:"us",label:"United States"},{value:"jp",label:"Japan"},{value:"de",label:"Germany"},{value:"fr",label:"France"}],D={title:"Components/Select",component:a,tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","md","lg"]}}},t={args:{id:"sel1",label:"Country",options:r,placeholder:"Select a country"}},n={args:{id:"sel2",label:"Region",options:r,helperText:"Choose your primary region"}},i={args:{id:"sel3",label:"Country",options:r,error:"Please select a country"}},d={args:{id:"sel4",label:"Country",options:r,disabled:!0,value:"br"}},c={args:{id:"sel5",label:"Country",options:[...r,{value:"xx",label:"Not available",disabled:!0}],placeholder:"Choose..."}},u={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1.5rem",maxWidth:"300px"},children:[e.jsx(a,{id:"ssm",size:"sm",label:"Small",options:r}),e.jsx(a,{id:"smd",size:"md",label:"Medium",options:r}),e.jsx(a,{id:"slg",size:"lg",label:"Large",options:r})]})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    id: 'sel1',
    label: 'Country',
    options: countries,
    placeholder: 'Select a country'
  }
}`,...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    id: 'sel2',
    label: 'Region',
    options: countries,
    helperText: 'Choose your primary region'
  }
}`,...n.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    id: 'sel3',
    label: 'Country',
    options: countries,
    error: 'Please select a country'
  }
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    id: 'sel4',
    label: 'Country',
    options: countries,
    disabled: true,
    value: 'br'
  }
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    id: 'sel5',
    label: 'Country',
    options: [...countries, {
      value: 'xx',
      label: 'Not available',
      disabled: true
    }],
    placeholder: 'Choose...'
  }
}`,...c.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    maxWidth: '300px'
  }}>\r
      <Select id="ssm" size="sm" label="Small" options={countries} />\r
      <Select id="smd" size="md" label="Medium" options={countries} />\r
      <Select id="slg" size="lg" label="Large" options={countries} />\r
    </div>
}`,...u.parameters?.docs?.source}}};const q=["Default","WithHelperText","WithError","Disabled","WithDisabledOption","Sizes"];export{t as Default,d as Disabled,u as Sizes,c as WithDisabledOption,i as WithError,n as WithHelperText,q as __namedExportsOrder,D as default};
