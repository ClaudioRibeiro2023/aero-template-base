import{j as r}from"./jsx-runtime-CSjhXfFz.js";import{S as a}from"./StatusBadge-CmSLrW55.js";import{c as l}from"./createLucideIcon-DA4OzSxG.js";import{C as m}from"./clock-i0QoL6_j.js";import{X as u}from"./x-lWMTmhcP.js";import{I as g}from"./info-hi-Wa6va.js";import"./index-BxY4JGwq.js";import"./_commonjsHelpers-CqkleIqs.js";import"./clsx-B-dksMZM.js";const p=l("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]),I={title:"Components/StatusBadge",component:a,tags:["autodocs"],parameters:{layout:"centered"},argTypes:{variant:{control:"select",options:["success","warning","error","info","pending"]},size:{control:"select",options:["sm","md"]}}},e={args:{variant:"success",children:"Concluído"}},n={args:{variant:"warning",children:"Pendente"}},s={args:{variant:"error",children:"Falhou"}},o={args:{variant:"info",children:"Em processamento"}},c={args:{variant:"pending",children:"Aguardando"}},t={args:{variant:"success",icon:r.jsx(p,{size:12}),children:"Aprovado"}},i={args:{variant:"info",size:"sm",children:"Small"}},d={render:()=>r.jsxs("div",{className:"flex flex-wrap gap-2",children:[r.jsx(a,{variant:"success",icon:r.jsx(p,{size:12}),children:"Concluído"}),r.jsx(a,{variant:"warning",icon:r.jsx(m,{size:12}),children:"Pendente"}),r.jsx(a,{variant:"error",icon:r.jsx(u,{size:12}),children:"Erro"}),r.jsx(a,{variant:"info",icon:r.jsx(g,{size:12}),children:"Info"}),r.jsx(a,{variant:"pending",icon:r.jsx(m,{size:12}),children:"Aguardando"})]})};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'success',
    children: 'Concluído'
  }
}`,...e.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'warning',
    children: 'Pendente'
  }
}`,...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'error',
    children: 'Falhou'
  }
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'info',
    children: 'Em processamento'
  }
}`,...o.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'pending',
    children: 'Aguardando'
  }
}`,...c.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'success',
    icon: <Check size={12} />,
    children: 'Aprovado'
  }
}`,...t.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'info',
    size: 'sm',
    children: 'Small'
  }
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-2">\r
      <StatusBadge variant="success" icon={<Check size={12} />}>\r
        Concluído\r
      </StatusBadge>\r
      <StatusBadge variant="warning" icon={<Clock size={12} />}>\r
        Pendente\r
      </StatusBadge>\r
      <StatusBadge variant="error" icon={<X size={12} />}>\r
        Erro\r
      </StatusBadge>\r
      <StatusBadge variant="info" icon={<InfoIcon size={12} />}>\r
        Info\r
      </StatusBadge>\r
      <StatusBadge variant="pending" icon={<Clock size={12} />}>\r
        Aguardando\r
      </StatusBadge>\r
    </div>
}`,...d.parameters?.docs?.source}}};const k=["Success","Warning","Error","InfoVariant","Pending","WithIcon","SmallSize","AllVariants"];export{d as AllVariants,s as Error,o as InfoVariant,c as Pending,i as SmallSize,e as Success,n as Warning,t as WithIcon,k as __namedExportsOrder,I as default};
