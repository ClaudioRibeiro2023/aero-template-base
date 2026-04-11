import{j as e}from"./jsx-runtime-CSjhXfFz.js";import"./index-BxY4JGwq.js";import{c as f}from"./clsx-B-dksMZM.js";import{S as N}from"./search-B4MFFvlx.js";import{B as n}from"./Button-BNyMHqOH.js";import{P as d}from"./plus-ybh5VCIm.js";import{c as x}from"./createLucideIcon-DA4OzSxG.js";import{C as v}from"./clock-i0QoL6_j.js";import"./_commonjsHelpers-CqkleIqs.js";/* empty css               */const h=x("FileX",[["path",{d:"M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z",key:"1nnpy2"}],["polyline",{points:"14 2 14 8 20 8",key:"1ew0cm"}],["line",{x1:"9.5",x2:"14.5",y1:"12.5",y2:"17.5",key:"izs6du"}],["line",{x1:"14.5",x2:"9.5",y1:"12.5",y2:"17.5",key:"1lehlj"}]]);const z=x("Inbox",[["polyline",{points:"22 12 16 12 14 15 10 15 8 12 2 12",key:"o97t9d"}],["path",{d:"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",key:"oot6mr"}]]);function c({title:m,description:p,icon:l,actions:u,className:g,children:y,...j}){return e.jsxs("div",{className:f("ds-empty-state",g),...j,children:[l&&e.jsx("div",{className:"ds-empty-state__icon",children:l}),e.jsx("h3",{className:"ds-empty-state__title",children:m}),p&&e.jsx("p",{className:"ds-empty-state__description",children:p}),y&&e.jsx("div",{className:"ds-empty-state__body",children:y}),u&&e.jsx("div",{className:"ds-empty-state__actions",children:u})]})}try{c.displayName="EmptyState",c.__docgenInfo={description:"",displayName:"EmptyState",props:{title:{defaultValue:null,description:"",name:"title",required:!0,type:{name:"string"}},description:{defaultValue:null,description:"",name:"description",required:!1,type:{name:"ReactNode"}},icon:{defaultValue:null,description:"",name:"icon",required:!1,type:{name:"ReactNode"}},actions:{defaultValue:null,description:"",name:"actions",required:!1,type:{name:"ReactNode"}}}}}catch{}const A={title:"Layout/EmptyState",component:c,tags:["autodocs"],parameters:{layout:"padded"}},t={args:{title:"Nenhum item encontrado",description:"Não há itens para exibir no momento."}},a={args:{title:"Nenhum resultado",description:"Sua busca não retornou nenhum resultado. Tente outros termos.",icon:e.jsx(N,{size:24})}},o={args:{title:"Caixa de entrada vazia",description:"Você não tem novas mensagens.",icon:e.jsx(z,{size:24}),actions:e.jsx(n,{variant:"primary",leftIcon:e.jsx(d,{size:18}),children:"Nova Mensagem"})}},r={args:{title:"Sem dados",description:"Comece adicionando seu primeiro registro.",icon:e.jsx(h,{size:24}),actions:e.jsx(n,{variant:"primary",leftIcon:e.jsx(d,{size:18}),children:"Adicionar"})}},s={args:{title:"Nenhuma solicitação realizada",description:"Suas solicitações de exportação ou exclusão de dados aparecerão aqui.",icon:e.jsx(v,{size:24})}},i={args:{title:"Nenhum projeto encontrado",description:"Você ainda não tem projetos. Comece criando um novo ou importe de um template.",icon:e.jsx(h,{size:24}),actions:e.jsxs("div",{className:"flex gap-2",children:[e.jsx(n,{variant:"secondary",children:"Importar"}),e.jsx(n,{variant:"primary",leftIcon:e.jsx(d,{size:18}),children:"Criar Projeto"})]})}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Nenhum item encontrado',
    description: 'Não há itens para exibir no momento.'
  }
}`,...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Nenhum resultado',
    description: 'Sua busca não retornou nenhum resultado. Tente outros termos.',
    icon: <Search size={24} />
  }
}`,...a.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Caixa de entrada vazia',
    description: 'Você não tem novas mensagens.',
    icon: <Inbox size={24} />,
    actions: <Button variant="primary" leftIcon={<Plus size={18} />}>\r
        Nova Mensagem\r
      </Button>
  }
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Sem dados',
    description: 'Comece adicionando seu primeiro registro.',
    icon: <FileX size={24} />,
    actions: <Button variant="primary" leftIcon={<Plus size={18} />}>\r
        Adicionar\r
      </Button>
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Nenhuma solicitação realizada',
    description: 'Suas solicitações de exportação ou exclusão de dados aparecerão aqui.',
    icon: <Clock size={24} />
  }
}`,...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Nenhum projeto encontrado',
    description: 'Você ainda não tem projetos. Comece criando um novo ou importe de um template.',
    icon: <FileX size={24} />,
    actions: <div className="flex gap-2">\r
        <Button variant="secondary">Importar</Button>\r
        <Button variant="primary" leftIcon={<Plus size={18} />}>\r
          Criar Projeto\r
        </Button>\r
      </div>
  }
}`,...i.parameters?.docs?.source}}};const E=["Default","WithIcon","WithAction","NoData","PendingRequests","WithMultipleActions"];export{t as Default,r as NoData,s as PendingRequests,o as WithAction,a as WithIcon,i as WithMultipleActions,E as __namedExportsOrder,A as default};
