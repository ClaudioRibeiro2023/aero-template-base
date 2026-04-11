import{j as e}from"./jsx-runtime-CSjhXfFz.js";import{r as q}from"./index-BxY4JGwq.js";import{c as h}from"./clsx-B-dksMZM.js";import{C}from"./chevron-down-BS89M68v.js";import"./_commonjsHelpers-CqkleIqs.js";import"./createLucideIcon-DA4OzSxG.js";function v({items:n,multiple:a=!1,value:o,defaultValue:s=[],onChange:l,className:i,...b}){const[x,I]=q.useState(s),_=o!==void 0,c=_?o:x,y=t=>{let d;c.includes(t)?d=c.filter(j=>j!==t):d=a?[...c,t]:[t],_||I(d),l?.(d)};return e.jsx("div",{className:h("ds-accordion",i),...b,children:n.map(t=>e.jsx(S,{item:t,isOpen:c.includes(t.value),onToggle:()=>!t.disabled&&y(t.value)},t.value))})}function S({item:n,isOpen:a,onToggle:o}){const s=q.useId(),l=`accordion-trigger-${s}`,i=`accordion-panel-${s}`;return e.jsxs("div",{className:"ds-accordion__item",children:[e.jsxs("button",{type:"button",id:l,className:"ds-accordion__trigger","aria-expanded":a,"aria-controls":i,onClick:o,disabled:n.disabled,children:[e.jsx("span",{children:n.title}),e.jsx(C,{size:16,className:h("ds-accordion__icon",a&&"ds-accordion__icon--open")})]}),e.jsx("div",{id:i,role:"region","aria-labelledby":l,className:h("ds-accordion__content",a?"ds-accordion__content--open":"ds-accordion__content--closed"),children:e.jsx("div",{className:"ds-accordion__body",children:n.content})})]})}try{v.displayName="Accordion",v.__docgenInfo={description:"",displayName:"Accordion",props:{items:{defaultValue:null,description:"Itens do accordion",name:"items",required:!0,type:{name:"AccordionItemData[]"}},multiple:{defaultValue:{value:"false"},description:"Permitir múltiplos abertos",name:"multiple",required:!1,type:{name:"boolean"}},value:{defaultValue:null,description:"Valores abertos (controlado)",name:"value",required:!1,type:{name:"string[]"}},defaultValue:{defaultValue:{value:"[]"},description:"Valor padrão aberto (não-controlado)",name:"defaultValue",required:!1,type:{name:"string[]"}},onChange:{defaultValue:null,description:"Callback ao mudar",name:"onChange",required:!1,type:{name:"((value: string[]) => void)"}}}}}catch{}const r=[{value:"q1",title:"What is this platform?",content:"A multi-tenant SaaS template with Next.js, Supabase Auth, and PostgreSQL."},{value:"q2",title:"How do I get started?",content:"Clone the repository, run docker compose up, and start developing."},{value:"q3",title:"Is it production-ready?",content:"Yes! It includes security headers, CSRF protection, and full test coverage."},{value:"q4",title:"Can I customize the theme?",content:"Absolutely. Design tokens can be modified in the design-system package."}],z={title:"Components/Accordion",component:v,tags:["autodocs"]},u={args:{items:r}},m={args:{items:r,defaultValue:["q1"]}},p={args:{items:r,multiple:!0,defaultValue:["q1","q3"]}},g={render:function(){const[a,o]=q.useState(["q2"]);return e.jsxs("div",{children:[e.jsxs("p",{style:{marginBottom:"0.5rem",fontSize:"0.875rem",color:"#64748b"},children:["Open: ",e.jsx("strong",{children:a.join(", ")||"none"})]}),e.jsx(v,{items:r,value:a,onChange:o,multiple:!0})]})}},f={args:{items:[...r.slice(0,2),{value:"q3",title:"Premium Feature (Locked)",content:"Upgrade to access.",disabled:!0},...r.slice(3)]}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    items: faqItems
  }
}`,...u.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    items: faqItems,
    defaultValue: ['q1']
  }
}`,...m.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    items: faqItems,
    multiple: true,
    defaultValue: ['q1', 'q3']
  }
}`,...p.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: function Demo() {
    const [value, setValue] = useState<string[]>(['q2']);
    return <div>\r
        <p style={{
        marginBottom: '0.5rem',
        fontSize: '0.875rem',
        color: '#64748b'
      }}>\r
          Open: <strong>{value.join(', ') || 'none'}</strong>\r
        </p>\r
        <Accordion items={faqItems} value={value} onChange={setValue} multiple />\r
      </div>;
  }
}`,...g.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    items: [...faqItems.slice(0, 2), {
      value: 'q3',
      title: 'Premium Feature (Locked)',
      content: 'Upgrade to access.',
      disabled: true
    }, ...faqItems.slice(3)]
  }
}`,...f.parameters?.docs?.source}}};const F=["Default","DefaultOpen","Multiple","Controlled","WithDisabled"];export{g as Controlled,u as Default,m as DefaultOpen,p as Multiple,f as WithDisabled,F as __namedExportsOrder,z as default};
