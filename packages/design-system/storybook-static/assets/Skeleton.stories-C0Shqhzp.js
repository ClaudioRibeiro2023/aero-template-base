import{j as e}from"./jsx-runtime-CSjhXfFz.js";import"./index-BxY4JGwq.js";import{c as _}from"./clsx-B-dksMZM.js";/* empty css                 */import"./_commonjsHelpers-CqkleIqs.js";function t({variant:a="text",width:r,height:n,animation:i="pulse",className:s,style:o,...j}){const w={...o,width:typeof r=="number"?`${r}px`:r,height:typeof n=="number"?`${n}px`:n};return e.jsx("div",{className:_("ds-skeleton",`ds-skeleton--${a}`,i!=="none"&&`ds-skeleton--${i}`,s),style:w,"aria-hidden":"true",...j})}function S({lines:a=3,className:r,...n}){return e.jsx("div",{className:_("ds-skeleton-text",r),children:Array.from({length:a}).map((i,s)=>e.jsx(t,{variant:"text",width:s===a-1?"60%":"100%",...n},s))})}function l({size:a=40,...r}){return e.jsx(t,{variant:"circular",width:a,height:a,...r})}function k({className:a,...r}){return e.jsxs("div",{className:_("ds-skeleton-card",a),...r,children:[e.jsx(t,{variant:"rectangular",height:200}),e.jsxs("div",{className:"ds-skeleton-card__content",children:[e.jsx(t,{variant:"text",width:"80%"}),e.jsx(t,{variant:"text",width:"60%"}),e.jsx(S,{lines:2})]})]})}function b({rows:a=5,columns:r=4,className:n,...i}){return e.jsxs("div",{className:_("ds-skeleton-table",n),...i,children:[e.jsx("div",{className:"ds-skeleton-table__row ds-skeleton-table__header",children:Array.from({length:r}).map((s,o)=>e.jsx(t,{variant:"text",height:20},o))}),Array.from({length:a}).map((s,o)=>e.jsx("div",{className:"ds-skeleton-table__row",children:Array.from({length:r}).map((j,w)=>e.jsx(t,{variant:"text",height:16},w))},o))]})}try{t.displayName="Skeleton",t.__docgenInfo={description:"",displayName:"Skeleton",props:{variant:{defaultValue:{value:"text"},description:"Variante do skeleton",name:"variant",required:!1,type:{name:"enum",value:[{value:'"text"'},{value:'"circular"'},{value:'"rectangular"'},{value:'"rounded"'}]}},width:{defaultValue:null,description:"Largura (CSS value)",name:"width",required:!1,type:{name:"string | number"}},height:{defaultValue:null,description:"Altura (CSS value)",name:"height",required:!1,type:{name:"string | number"}},animation:{defaultValue:{value:"pulse"},description:"Animação de pulse",name:"animation",required:!1,type:{name:"enum",value:[{value:'"none"'},{value:'"pulse"'},{value:'"wave"'}]}}}}}catch{}try{S.displayName="SkeletonText",S.__docgenInfo={description:"",displayName:"SkeletonText",props:{variant:{defaultValue:null,description:"Variante do skeleton",name:"variant",required:!1,type:{name:"enum",value:[{value:'"text"'},{value:'"circular"'},{value:'"rectangular"'},{value:'"rounded"'}]}},width:{defaultValue:null,description:"Largura (CSS value)",name:"width",required:!1,type:{name:"string | number"}},height:{defaultValue:null,description:"Altura (CSS value)",name:"height",required:!1,type:{name:"string | number"}},animation:{defaultValue:null,description:"Animação de pulse",name:"animation",required:!1,type:{name:"enum",value:[{value:'"none"'},{value:'"pulse"'},{value:'"wave"'}]}},lines:{defaultValue:{value:"3"},description:"",name:"lines",required:!1,type:{name:"number"}}}}}catch{}try{l.displayName="SkeletonAvatar",l.__docgenInfo={description:"",displayName:"SkeletonAvatar",props:{variant:{defaultValue:null,description:"Variante do skeleton",name:"variant",required:!1,type:{name:"enum",value:[{value:'"text"'},{value:'"circular"'},{value:'"rectangular"'},{value:'"rounded"'}]}},width:{defaultValue:null,description:"Largura (CSS value)",name:"width",required:!1,type:{name:"string | number"}},height:{defaultValue:null,description:"Altura (CSS value)",name:"height",required:!1,type:{name:"string | number"}},animation:{defaultValue:null,description:"Animação de pulse",name:"animation",required:!1,type:{name:"enum",value:[{value:'"none"'},{value:'"pulse"'},{value:'"wave"'}]}},size:{defaultValue:{value:"40"},description:"",name:"size",required:!1,type:{name:"number"}}}}}catch{}try{k.displayName="SkeletonCard",k.__docgenInfo={description:"",displayName:"SkeletonCard",props:{variant:{defaultValue:null,description:"Variante do skeleton",name:"variant",required:!1,type:{name:"enum",value:[{value:'"text"'},{value:'"circular"'},{value:'"rectangular"'},{value:'"rounded"'}]}},width:{defaultValue:null,description:"Largura (CSS value)",name:"width",required:!1,type:{name:"string | number"}},height:{defaultValue:null,description:"Altura (CSS value)",name:"height",required:!1,type:{name:"string | number"}},animation:{defaultValue:null,description:"Animação de pulse",name:"animation",required:!1,type:{name:"enum",value:[{value:'"none"'},{value:'"pulse"'},{value:'"wave"'}]}}}}}catch{}try{b.displayName="SkeletonTable",b.__docgenInfo={description:"",displayName:"SkeletonTable",props:{variant:{defaultValue:null,description:"Variante do skeleton",name:"variant",required:!1,type:{name:"enum",value:[{value:'"text"'},{value:'"circular"'},{value:'"rectangular"'},{value:'"rounded"'}]}},width:{defaultValue:null,description:"Largura (CSS value)",name:"width",required:!1,type:{name:"string | number"}},height:{defaultValue:null,description:"Altura (CSS value)",name:"height",required:!1,type:{name:"string | number"}},animation:{defaultValue:null,description:"Animação de pulse",name:"animation",required:!1,type:{name:"enum",value:[{value:'"none"'},{value:'"pulse"'},{value:'"wave"'}]}},rows:{defaultValue:{value:"5"},description:"",name:"rows",required:!1,type:{name:"number"}},columns:{defaultValue:{value:"4"},description:"",name:"columns",required:!1,type:{name:"number"}}}}}catch{}const T={title:"Components/Skeleton",component:t,tags:["autodocs"],argTypes:{variant:{control:"select",options:["text","circular","rectangular","rounded"]},animation:{control:"select",options:["pulse","wave","none"]}}},u={args:{width:200,height:20}},d={args:{variant:"text",width:200}},c={args:{variant:"circular",width:50,height:50}},m={args:{variant:"rectangular",width:200,height:100}},p={args:{variant:"rectangular",width:200,height:100,animation:"wave"}},v={args:{variant:"rectangular",width:200,height:100,animation:"none"}},h={render:()=>e.jsx(S,{lines:4}),parameters:{layout:"padded"}},g={render:()=>e.jsxs("div",{style:{display:"flex",gap:"1rem"},children:[e.jsx(l,{size:32}),e.jsx(l,{size:48}),e.jsx(l,{size:64})]})},x={render:()=>e.jsx(k,{}),decorators:[a=>e.jsx("div",{style:{width:"300px"},children:e.jsx(a,{})})]},f={render:()=>e.jsx(b,{rows:5,columns:4}),decorators:[a=>e.jsx("div",{style:{width:"600px"},children:e.jsx(a,{})})]},y={render:()=>e.jsxs("div",{style:{display:"flex",gap:"1rem",alignItems:"center",padding:"1rem",background:"white",borderRadius:"8px",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"},children:[e.jsx(l,{size:48}),e.jsxs("div",{style:{flex:1},children:[e.jsx(t,{variant:"text",width:"60%",height:16}),e.jsx("div",{style:{height:"8px"}}),e.jsx(t,{variant:"text",width:"40%",height:14})]})]})};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    width: 200,
    height: 20
  }
}`,...u.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'text',
    width: 200
  }
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'circular',
    width: 50,
    height: 50
  }
}`,...c.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'rectangular',
    width: 200,
    height: 100
  }
}`,...m.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'rectangular',
    width: 200,
    height: 100,
    animation: 'wave'
  }
}`,...p.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'rectangular',
    width: 200,
    height: 100,
    animation: 'none'
  }
}`,...v.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <SkeletonText lines={4} />,
  parameters: {
    layout: 'padded'
  }
}`,...h.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '1rem'
  }}>\r
      <SkeletonAvatar size={32} />\r
      <SkeletonAvatar size={48} />\r
      <SkeletonAvatar size={64} />\r
    </div>
}`,...g.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <SkeletonCard />,
  decorators: [Story => <div style={{
    width: '300px'
  }}><Story /></div>]
}`,...x.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <SkeletonTable rows={5} columns={4} />,
  decorators: [Story => <div style={{
    width: '600px'
  }}><Story /></div>]
}`,...f.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    padding: '1rem',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }}>\r
      <SkeletonAvatar size={48} />\r
      <div style={{
      flex: 1
    }}>\r
        <Skeleton variant="text" width="60%" height={16} />\r
        <div style={{
        height: '8px'
      }} />\r
        <Skeleton variant="text" width="40%" height={14} />\r
      </div>\r
    </div>
}`,...y.parameters?.docs?.source}}};const E=["Default","Text","Circular","Rectangular","WaveAnimation","NoAnimation","TextBlock","Avatar","CardSkeleton","TableSkeleton","UserCard"];export{g as Avatar,x as CardSkeleton,c as Circular,u as Default,v as NoAnimation,m as Rectangular,f as TableSkeleton,d as Text,h as TextBlock,y as UserCard,p as WaveAnimation,E as __namedExportsOrder,T as default};
