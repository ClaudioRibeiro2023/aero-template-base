import{j as e}from"./jsx-runtime-CSjhXfFz.js";import"./index-BxY4JGwq.js";import{c as f}from"./clsx-B-dksMZM.js";import{H as m}from"./home-t1zg2Skf.js";import{c as h}from"./createLucideIcon-DA4OzSxG.js";import{S as v}from"./settings-CG7BJskn.js";import"./_commonjsHelpers-CqkleIqs.js";const N=h("BarChart3",[["path",{d:"M3 3v18h18",key:"1s2lah"}],["path",{d:"M18 17V9",key:"2bz60n"}],["path",{d:"M13 17V5",key:"1frdt8"}],["path",{d:"M8 17v-3",key:"17ska0"}]]);const g=h("Bell",[["path",{d:"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9",key:"1qo2s2"}],["path",{d:"M10.3 21a1.94 1.94 0 0 0 3.4 0",key:"qgo35s"}]]);const b=h("FileText",[["path",{d:"M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z",key:"1nnpy2"}],["polyline",{points:"14 2 14 8 20 8",key:"1ew0cm"}],["line",{x1:"16",x2:"8",y1:"13",y2:"13",key:"14keom"}],["line",{x1:"16",x2:"8",y1:"17",y2:"17",key:"17nazh"}],["line",{x1:"10",x2:"8",y1:"9",y2:"9",key:"1a5vjj"}]]);const j=h("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]]);function a({icon:r,active:i=!1,disabled:n=!1,badge:o,className:y,children:x,...k}){return e.jsxs("a",{className:f("ds-nav-link",i&&"ds-nav-link--active",n&&"ds-nav-link--disabled",y),"aria-current":i?"page":void 0,"aria-disabled":n||void 0,...k,children:[r&&e.jsx("span",{className:"ds-nav-link__icon",children:r}),e.jsx("span",{children:x}),o!==void 0&&e.jsx("span",{className:"ds-nav-link__badge",children:o})]})}function s({label:r,className:i,children:n,...o}){return e.jsxs("div",{className:f("ds-nav-group",i),role:"group","aria-label":r,...o,children:[r&&e.jsx("span",{className:"ds-nav-group__label",children:r}),n]})}try{a.displayName="NavLink",a.__docgenInfo={description:"",displayName:"NavLink",props:{icon:{defaultValue:null,description:"Ícone à esquerda",name:"icon",required:!1,type:{name:"ReactNode"}},active:{defaultValue:{value:"false"},description:"Se é a rota ativa",name:"active",required:!1,type:{name:"boolean"}},disabled:{defaultValue:{value:"false"},description:"Desabilitado",name:"disabled",required:!1,type:{name:"boolean"}},badge:{defaultValue:null,description:"Badge/counter à direita",name:"badge",required:!1,type:{name:"ReactNode"}}}}}catch{}try{s.displayName="NavGroup",s.__docgenInfo={description:"",displayName:"NavGroup",props:{label:{defaultValue:null,description:"Label do grupo",name:"label",required:!1,type:{name:"string"}}}}}catch{}const B={title:"Navigation/NavLink",component:a,tags:["autodocs"]},t={args:{href:"/",children:"Dashboard"}},c={args:{href:"/",icon:e.jsx(m,{size:16}),children:"Home"}},d={args:{href:"/",icon:e.jsx(m,{size:16}),active:!0,children:"Home"}},l={args:{href:"/notifications",icon:e.jsx(g,{size:16}),badge:12,children:"Notifications"}},p={args:{href:"/",icon:e.jsx(v,{size:16}),disabled:!0,children:"Settings"}},u={render:()=>e.jsxs("div",{style:{width:"240px",padding:"0.5rem",background:"#fff",border:"1px solid #e2e8f0",borderRadius:"0.5rem"},children:[e.jsxs(s,{label:"Main",children:[e.jsx(a,{href:"/",icon:e.jsx(m,{size:16}),active:!0,children:"Dashboard"}),e.jsx(a,{href:"/analytics",icon:e.jsx(N,{size:16}),children:"Analytics"}),e.jsx(a,{href:"/users",icon:e.jsx(j,{size:16}),badge:3,children:"Users"})]}),e.jsxs(s,{label:"Content",children:[e.jsx(a,{href:"/docs",icon:e.jsx(b,{size:16}),children:"Documents"}),e.jsx(a,{href:"/notifications",icon:e.jsx(g,{size:16}),badge:12,children:"Notifications"})]}),e.jsx(s,{label:"System",children:e.jsx(a,{href:"/settings",icon:e.jsx(v,{size:16}),children:"Settings"})})]})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    href: '/',
    children: 'Dashboard'
  }
}`,...t.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    href: '/',
    icon: <Home size={16} />,
    children: 'Home'
  }
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    href: '/',
    icon: <Home size={16} />,
    active: true,
    children: 'Home'
  }
}`,...d.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    href: '/notifications',
    icon: <Bell size={16} />,
    badge: 12,
    children: 'Notifications'
  }
}`,...l.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    href: '/',
    icon: <Settings size={16} />,
    disabled: true,
    children: 'Settings'
  }
}`,...p.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    width: '240px',
    padding: '0.5rem',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem'
  }}>\r
      <NavGroup label="Main">\r
        <NavLink href="/" icon={<Home size={16} />} active>\r
          Dashboard\r
        </NavLink>\r
        <NavLink href="/analytics" icon={<BarChart3 size={16} />}>\r
          Analytics\r
        </NavLink>\r
        <NavLink href="/users" icon={<Users size={16} />} badge={3}>\r
          Users\r
        </NavLink>\r
      </NavGroup>\r
      <NavGroup label="Content">\r
        <NavLink href="/docs" icon={<FileText size={16} />}>\r
          Documents\r
        </NavLink>\r
        <NavLink href="/notifications" icon={<Bell size={16} />} badge={12}>\r
          Notifications\r
        </NavLink>\r
      </NavGroup>\r
      <NavGroup label="System">\r
        <NavLink href="/settings" icon={<Settings size={16} />}>\r
          Settings\r
        </NavLink>\r
      </NavGroup>\r
    </div>
}`,...u.parameters?.docs?.source}}};const q=["Default","WithIcon","Active","WithBadge","Disabled","Sidebar"];export{d as Active,t as Default,p as Disabled,u as Sidebar,l as WithBadge,c as WithIcon,q as __namedExportsOrder,B as default};
