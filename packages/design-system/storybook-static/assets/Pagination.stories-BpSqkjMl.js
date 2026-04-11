import{j as t}from"./jsx-runtime-CSjhXfFz.js";import{r as i}from"./index-BxY4JGwq.js";import{c as v}from"./clsx-B-dksMZM.js";import{c as S}from"./createLucideIcon-DA4OzSxG.js";import{C as b}from"./chevron-right-CkFYNs00.js";import"./_commonjsHelpers-CqkleIqs.js";const C=S("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);function d(a,e){return Array.from({length:e-a+1},(n,r)=>a+r)}function _(a,e,n){return i.useMemo(()=>{const r=n*2+5;if(e<=r)return d(1,e);const c=Math.max(a-n,1),u=Math.min(a+n,e),p=c>2,g=u<e-1;if(!p&&g){const l=n*2+3;return[...d(1,l),"ellipsis",e]}if(p&&!g){const l=n*2+3;return[1,"ellipsis",...d(e-l+1,e)]}return[1,"ellipsis",...d(c,u),"ellipsis",e]},[a,e,n])}function s({page:a,totalPages:e,onChange:n,siblings:r=1,size:c="md",showPrevNext:u=!0,className:p,...g}){const l=_(a,e,r);return e<=1?null:t.jsxs("nav",{"aria-label":"Pagination",className:v("ds-pagination",`ds-pagination--${c}`,p),...g,children:[u&&t.jsx("button",{type:"button",className:"ds-pagination__button",onClick:()=>n(a-1),disabled:a<=1,"aria-label":"Previous page",children:t.jsx(C,{size:16})}),l.map((o,y)=>o==="ellipsis"?t.jsx("span",{className:"ds-pagination__ellipsis",children:"…"},`ellipsis-${y}`):t.jsx("button",{type:"button",className:v("ds-pagination__button",o===a&&"ds-pagination__button--active"),onClick:()=>n(o),"aria-current":o===a?"page":void 0,"aria-label":`Page ${o}`,children:o},o)),u&&t.jsx("button",{type:"button",className:"ds-pagination__button",onClick:()=>n(a+1),disabled:a>=e,"aria-label":"Next page",children:t.jsx(b,{size:16})})]})}try{s.displayName="Pagination",s.__docgenInfo={description:"",displayName:"Pagination",props:{page:{defaultValue:null,description:"Página atual (1-indexed)",name:"page",required:!0,type:{name:"number"}},totalPages:{defaultValue:null,description:"Total de páginas",name:"totalPages",required:!0,type:{name:"number"}},onChange:{defaultValue:null,description:"Callback ao mudar de página",name:"onChange",required:!0,type:{name:"(page: number) => void"}},siblings:{defaultValue:{value:"1"},description:"Número de páginas adjacentes visíveis",name:"siblings",required:!1,type:{name:"number"}},size:{defaultValue:{value:"md"},description:"Tamanho",name:"size",required:!1,type:{name:"enum",value:[{value:'"sm"'},{value:'"md"'},{value:'"lg"'}]}},showPrevNext:{defaultValue:{value:"true"},description:"Mostrar botões prev/next",name:"showPrevNext",required:!1,type:{name:"boolean"}}}}}catch{}const k={title:"Components/Pagination",component:s,tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","md","lg"]}}},m={render:function(){const[e,n]=i.useState(1);return t.jsx(s,{page:e,totalPages:10,onChange:n})}},f={render:function(){const[e,n]=i.useState(10);return t.jsx(s,{page:e,totalPages:50,onChange:n})}},h={render:function(){const[e,n]=i.useState(1);return t.jsx(s,{page:e,totalPages:3,onChange:n})}},P={render:function(){const[e,n]=i.useState(1);return t.jsx(s,{page:e,totalPages:10,onChange:n,showPrevNext:!1})}},x={render:function(){const[e,n]=i.useState(3);return t.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"1.5rem"},children:["sm","md","lg"].map(r=>t.jsxs("div",{children:[t.jsxs("p",{style:{marginBottom:"0.5rem",fontWeight:600,fontSize:"0.875rem"},children:["Size: ",r]}),t.jsx(s,{page:e,totalPages:10,onChange:n,size:r})]},r))})}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: function Demo() {
    const [page, setPage] = useState(1);
    return <Pagination page={page} totalPages={10} onChange={setPage} />;
  }
}`,...m.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: function Demo() {
    const [page, setPage] = useState(10);
    return <Pagination page={page} totalPages={50} onChange={setPage} />;
  }
}`,...f.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: function Demo() {
    const [page, setPage] = useState(1);
    return <Pagination page={page} totalPages={3} onChange={setPage} />;
  }
}`,...h.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: function Demo() {
    const [page, setPage] = useState(1);
    return <Pagination page={page} totalPages={10} onChange={setPage} showPrevNext={false} />;
  }
}`,...P.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: function Demo() {
    const [page, setPage] = useState(3);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    }}>\r
        {(['sm', 'md', 'lg'] as const).map(size => <div key={size}>\r
            <p style={{
          marginBottom: '0.5rem',
          fontWeight: 600,
          fontSize: '0.875rem'
        }}>\r
              Size: {size}\r
            </p>\r
            <Pagination page={page} totalPages={10} onChange={setPage} size={size} />\r
          </div>)}\r
      </div>;
  }
}`,...x.parameters?.docs?.source}}};const q=["Default","ManyPages","FewPages","WithoutPrevNext","AllSizes"];export{x as AllSizes,m as Default,h as FewPages,f as ManyPages,P as WithoutPrevNext,q as __namedExportsOrder,k as default};
