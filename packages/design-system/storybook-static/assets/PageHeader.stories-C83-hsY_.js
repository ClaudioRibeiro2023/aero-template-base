import{j as e}from"./jsx-runtime-CSjhXfFz.js";import"./index-BxY4JGwq.js";import{c as y}from"./clsx-B-dksMZM.js";import{c as o}from"./createLucideIcon-DA4OzSxG.js";import{B as c}from"./Button-BNyMHqOH.js";import{P as x}from"./plus-ybh5VCIm.js";import"./_commonjsHelpers-CqkleIqs.js";/* empty css               */const v=o("Activity",[["path",{d:"M22 12h-4l-3 9L9 3l-3 9H2",key:"d5dnw9"}]]);const _=o("Database",[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]]);const j=o("History",[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}],["path",{d:"M12 7v5l4 2",key:"1fdv2h"}]]);const u=o("RefreshCw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]);function n({title:d,description:l,icon:p,actions:m,className:h,children:g,...f}){return e.jsxs("div",{className:y("ds-page-header",h),...f,children:[e.jsxs("div",{className:"ds-page-header__main",children:[p&&e.jsx("div",{className:"ds-page-header__icon",children:p}),e.jsxs("div",{className:"ds-page-header__text",children:[e.jsx("h1",{className:"ds-page-header__title",children:d}),l&&e.jsx("p",{className:"ds-page-header__description",children:l}),g]})]}),m&&e.jsx("div",{className:"ds-page-header__actions",children:m})]})}try{n.displayName="PageHeader",n.__docgenInfo={description:"",displayName:"PageHeader",props:{title:{defaultValue:null,description:"",name:"title",required:!0,type:{name:"string"}},description:{defaultValue:null,description:"",name:"description",required:!1,type:{name:"ReactNode"}},icon:{defaultValue:null,description:"",name:"icon",required:!1,type:{name:"ReactNode"}},actions:{defaultValue:null,description:"",name:"actions",required:!1,type:{name:"ReactNode"}}}}}catch{}const L={title:"Layout/PageHeader",component:n,tags:["autodocs"],parameters:{layout:"padded"}},a={args:{title:"Título da Página",description:"Descrição curta explicando o propósito da página."}},t={args:{title:"ETL & Integração",description:"Importação, tratamento e catálogo de dados",icon:e.jsx(_,{size:28})}},s={args:{title:"Métricas",description:"Prometheus/metrics de API e jobs",icon:e.jsx(v,{size:28}),actions:e.jsx(c,{variant:"ghost",leftIcon:e.jsx(u,{size:18}),children:"Atualizar"})}},r={args:{title:"Logs & Histórico",description:"Rastreabilidade e reprocessamento",icon:e.jsx(j,{size:28}),actions:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(c,{variant:"ghost",leftIcon:e.jsx(u,{size:18}),children:"Atualizar"}),e.jsx(c,{variant:"primary",leftIcon:e.jsx(x,{size:18}),children:"Novo"})]})}},i={args:{title:"Página Simples"}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Título da Página',
    description: 'Descrição curta explicando o propósito da página.'
  }
}`,...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'ETL & Integração',
    description: 'Importação, tratamento e catálogo de dados',
    icon: <Database size={28} />
  }
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Métricas',
    description: 'Prometheus/metrics de API e jobs',
    icon: <Activity size={28} />,
    actions: <Button variant="ghost" leftIcon={<RefreshCw size={18} />}>\r
        Atualizar\r
      </Button>
  }
}`,...s.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Logs & Histórico',
    description: 'Rastreabilidade e reprocessamento',
    icon: <History size={28} />,
    actions: <div className="flex items-center gap-2">\r
        <Button variant="ghost" leftIcon={<RefreshCw size={18} />}>\r
          Atualizar\r
        </Button>\r
        <Button variant="primary" leftIcon={<Plus size={18} />}>\r
          Novo\r
        </Button>\r
      </div>
  }
}`,...r.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Página Simples'
  }
}`,...i.parameters?.docs?.source}}};const R=["Default","WithIcon","WithActions","WithMultipleActions","MinimalHeader"];export{a as Default,i as MinimalHeader,s as WithActions,t as WithIcon,r as WithMultipleActions,R as __namedExportsOrder,L as default};
