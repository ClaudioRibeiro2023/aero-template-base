import{j as r}from"./jsx-runtime-CSjhXfFz.js";import{r as f}from"./index-BxY4JGwq.js";import{c as i}from"./clsx-B-dksMZM.js";import{C as B}from"./chevron-right-CkFYNs00.js";import{H as I}from"./home-t1zg2Skf.js";import"./_commonjsHelpers-CqkleIqs.js";import"./createLucideIcon-DA4OzSxG.js";function a({separator:t,className:p,children:c,...m}){const s=f.Children.toArray(c),b=t||r.jsx(B,{size:14});return r.jsx("nav",{"aria-label":"Breadcrumb",className:i("ds-breadcrumb",p),...m,children:s.map((h,l)=>r.jsxs("span",{className:"ds-breadcrumb__item",children:[h,l<s.length-1&&r.jsx("span",{className:"ds-breadcrumb__separator","aria-hidden":"true",children:b})]},l))})}function e({href:t,current:p=!1,className:c,children:m,...s}){return p?r.jsx("span",{className:i("ds-breadcrumb__current",c),"aria-current":"page",...s,children:m}):t?r.jsx("a",{href:t,className:i("ds-breadcrumb__link",c),...s,children:m}):r.jsx("button",{type:"button",className:i("ds-breadcrumb__link",c),...s,children:m})}try{a.displayName="Breadcrumb",a.__docgenInfo={description:"",displayName:"Breadcrumb",props:{separator:{defaultValue:null,description:"Separador customizado",name:"separator",required:!1,type:{name:"ReactNode"}}}}}catch{}try{e.displayName="BreadcrumbItem",e.__docgenInfo={description:"",displayName:"BreadcrumbItem",props:{href:{defaultValue:null,description:"URL do link (se fornecido, renderiza <a>)",name:"href",required:!1,type:{name:"string"}},current:{defaultValue:{value:"false"},description:"Se é a página atual",name:"current",required:!1,type:{name:"boolean"}}}}}catch{}const N={title:"Components/Breadcrumb",component:a,tags:["autodocs"]},n={render:()=>r.jsxs(a,{children:[r.jsx(e,{href:"/",children:"Home"}),r.jsx(e,{href:"/products",children:"Products"}),r.jsx(e,{current:!0,children:"Category"})]})},d={render:()=>r.jsxs(a,{separator:"/",children:[r.jsx(e,{href:"/",children:"Home"}),r.jsx(e,{href:"/docs",children:"Docs"}),r.jsx(e,{current:!0,children:"API Reference"})]})},o={render:()=>r.jsxs(a,{children:[r.jsx(e,{href:"/",children:r.jsx(I,{size:14})}),r.jsx(e,{href:"/settings",children:"Settings"}),r.jsx(e,{current:!0,children:"Profile"})]})},u={render:()=>r.jsxs(a,{children:[r.jsx(e,{href:"/",children:"Home"}),r.jsx(e,{current:!0,children:"Dashboard"})]})};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumb>\r
      <BreadcrumbItem href="/">Home</BreadcrumbItem>\r
      <BreadcrumbItem href="/products">Products</BreadcrumbItem>\r
      <BreadcrumbItem current>Category</BreadcrumbItem>\r
    </Breadcrumb>
}`,...n.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumb separator="/">\r
      <BreadcrumbItem href="/">Home</BreadcrumbItem>\r
      <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>\r
      <BreadcrumbItem current>API Reference</BreadcrumbItem>\r
    </Breadcrumb>
}`,...d.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumb>\r
      <BreadcrumbItem href="/">\r
        <Home size={14} />\r
      </BreadcrumbItem>\r
      <BreadcrumbItem href="/settings">Settings</BreadcrumbItem>\r
      <BreadcrumbItem current>Profile</BreadcrumbItem>\r
    </Breadcrumb>
}`,...o.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumb>\r
      <BreadcrumbItem href="/">Home</BreadcrumbItem>\r
      <BreadcrumbItem current>Dashboard</BreadcrumbItem>\r
    </Breadcrumb>
}`,...u.parameters?.docs?.source}}};const C=["Default","WithCustomSeparator","WithIcon","TwoItems"];export{n as Default,u as TwoItems,d as WithCustomSeparator,o as WithIcon,C as __namedExportsOrder,N as default};
