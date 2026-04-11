import{j as e}from"./jsx-runtime-CSjhXfFz.js";import{r as _}from"./index-BxY4JGwq.js";import{c as E}from"./clsx-B-dksMZM.js";import{I as l}from"./info-hi-Wa6va.js";import{C as A}from"./check-circle-CO1UfONf.js";import{A as g}from"./alert-triangle-C2XFMsst.js";import{c as y}from"./createLucideIcon-DA4OzSxG.js";import{M as C}from"./mail-BelTTDqz.js";import"./_commonjsHelpers-CqkleIqs.js";const x=y("XCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]]),r=_.forwardRef(({variant:d="info",title:m,description:p,icon:u,actions:f,className:j,children:v,...h},z)=>e.jsxs("div",{ref:z,className:E("ds-alert",`ds-alert--${d}`,j),role:"alert",...h,children:[u&&e.jsx("div",{className:"ds-alert__icon",children:u}),e.jsxs("div",{className:"ds-alert__content",children:[m&&e.jsx("h3",{className:"ds-alert__title",children:m}),p&&e.jsx("p",{className:"ds-alert__description",children:p}),v&&e.jsx("div",{className:"ds-alert__body",children:v})]}),f&&e.jsx("div",{className:"ds-alert__actions",children:f})]}));r.displayName="Alert";try{r.displayName="Alert",r.__docgenInfo={description:"",displayName:"Alert",props:{variant:{defaultValue:{value:"info"},description:"Variante visual do alerta",name:"variant",required:!1,type:{name:"enum",value:[{value:'"success"'},{value:'"warning"'},{value:'"error"'},{value:'"info"'}]}},title:{defaultValue:null,description:"Título do alerta",name:"title",required:!1,type:{name:"string"}},description:{defaultValue:null,description:"Descrição principal",name:"description",required:!1,type:{name:"ReactNode"}},icon:{defaultValue:null,description:"Ícone opcional à esquerda",name:"icon",required:!1,type:{name:"ReactNode"}},actions:{defaultValue:null,description:"Ações à direita (botões, links)",name:"actions",required:!1,type:{name:"ReactNode"}}}}}catch{}const D={title:"Components/Alert",component:r,tags:["autodocs"],parameters:{layout:"padded"},argTypes:{variant:{control:"select",options:["info","success","warning","error"]}}},a={args:{variant:"info",title:"Informação",description:"Esta é uma mensagem informativa para o usuário.",icon:e.jsx(l,{size:20})}},s={args:{variant:"success",title:"Sucesso!",description:"A operação foi concluída com sucesso.",icon:e.jsx(A,{size:20})}},o={args:{variant:"warning",title:"Atenção",description:"Esta ação pode ter consequências. Por favor, revise antes de continuar.",icon:e.jsx(g,{size:20})}},t={args:{variant:"error",title:"Erro",description:"Ocorreu um erro ao processar sua solicitação. Tente novamente.",icon:e.jsx(x,{size:20})}},i={args:{variant:"info",description:"Alerta simples sem título, apenas com descrição.",icon:e.jsx(l,{size:20})}},n={args:{variant:"info",title:"Dúvidas?",icon:e.jsx(C,{size:20}),description:e.jsxs("span",{children:["Entre em contato:"," ",e.jsx("a",{href:"mailto:suporte@empresa.com",className:"text-color-info hover:underline",children:"suporte@empresa.com"})]})}},c={render:()=>e.jsxs("div",{className:"space-y-4",children:[e.jsx(r,{variant:"info",title:"Informação",description:"Alerta informativo.",icon:e.jsx(l,{size:20})}),e.jsx(r,{variant:"success",title:"Sucesso",description:"Alerta de sucesso.",icon:e.jsx(A,{size:20})}),e.jsx(r,{variant:"warning",title:"Atenção",description:"Alerta de aviso.",icon:e.jsx(g,{size:20})}),e.jsx(r,{variant:"error",title:"Erro",description:"Alerta de erro.",icon:e.jsx(x,{size:20})})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'info',
    title: 'Informação',
    description: 'Esta é uma mensagem informativa para o usuário.',
    icon: <Info size={20} />
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'success',
    title: 'Sucesso!',
    description: 'A operação foi concluída com sucesso.',
    icon: <CheckCircle size={20} />
  }
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'warning',
    title: 'Atenção',
    description: 'Esta ação pode ter consequências. Por favor, revise antes de continuar.',
    icon: <AlertTriangle size={20} />
  }
}`,...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'error',
    title: 'Erro',
    description: 'Ocorreu um erro ao processar sua solicitação. Tente novamente.',
    icon: <XCircle size={20} />
  }
}`,...t.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'info',
    description: 'Alerta simples sem título, apenas com descrição.',
    icon: <Info size={20} />
  }
}`,...i.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'info',
    title: 'Dúvidas?',
    icon: <Mail size={20} />,
    description: <span>\r
        Entre em contato:{' '}\r
        <a href="mailto:suporte@empresa.com" className="text-color-info hover:underline">\r
          suporte@empresa.com\r
        </a>\r
      </span>
  }
}`,...n.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-4">\r
      <Alert variant="info" title="Informação" description="Alerta informativo." icon={<Info size={20} />} />\r
      <Alert variant="success" title="Sucesso" description="Alerta de sucesso." icon={<CheckCircle size={20} />} />\r
      <Alert variant="warning" title="Atenção" description="Alerta de aviso." icon={<AlertTriangle size={20} />} />\r
      <Alert variant="error" title="Erro" description="Alerta de erro." icon={<XCircle size={20} />} />\r
    </div>
}`,...c.parameters?.docs?.source}}};const R=["InfoAlert","SuccessAlert","WarningAlert","ErrorAlert","WithoutTitle","WithCustomContent","AllVariants"];export{c as AllVariants,t as ErrorAlert,a as InfoAlert,s as SuccessAlert,o as WarningAlert,n as WithCustomContent,i as WithoutTitle,R as __namedExportsOrder,D as default};
