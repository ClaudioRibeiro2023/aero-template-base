import{j as t}from"./jsx-runtime-CSjhXfFz.js";import{r as m}from"./index-BxY4JGwq.js";import{c as f}from"./clsx-B-dksMZM.js";import{B as o}from"./Button-BNyMHqOH.js";import"./_commonjsHelpers-CqkleIqs.js";/* empty css               */function e({content:l,position:h="top",delay:p=200,disabled:g=!1,className:v,children:x,...y}){const[T,a]=m.useState(!1),[c,B]=m.useState(null),d=()=>{if(g)return;if(p<=0){a(!0);return}const b=setTimeout(()=>a(!0),p);B(b)},u=()=>{c&&clearTimeout(c),a(!1)};return t.jsxs("div",{className:f("ds-tooltip-wrapper",v),onMouseEnter:d,onMouseLeave:u,onFocus:d,onBlur:u,...y,children:[x,t.jsx("div",{role:"tooltip",className:f("ds-tooltip",`ds-tooltip--${h}`,T&&"ds-tooltip--visible"),children:l})]})}try{e.displayName="Tooltip",e.__docgenInfo={description:"",displayName:"Tooltip",props:{content:{defaultValue:null,description:"Texto do tooltip",name:"content",required:!0,type:{name:"string"}},position:{defaultValue:{value:"top"},description:"Posição do tooltip",name:"position",required:!1,type:{name:"enum",value:[{value:'"top"'},{value:'"bottom"'},{value:'"left"'},{value:'"right"'}]}},delay:{defaultValue:{value:"200"},description:"Delay em ms antes de mostrar",name:"delay",required:!1,type:{name:"number"}},disabled:{defaultValue:{value:"false"},description:"Desabilitar tooltip",name:"disabled",required:!1,type:{name:"boolean"}}}}}catch{}const L={title:"Components/Tooltip",component:e,tags:["autodocs"],argTypes:{position:{control:"select",options:["top","bottom","left","right"]}}},i={args:{content:"This is a tooltip",children:t.jsx(o,{children:"Hover me"})}},r={render:()=>t.jsxs("div",{style:{display:"flex",gap:"2rem",padding:"3rem",justifyContent:"center"},children:[t.jsx(e,{content:"Top tooltip",position:"top",children:t.jsx(o,{variant:"outline",children:"Top"})}),t.jsx(e,{content:"Bottom tooltip",position:"bottom",children:t.jsx(o,{variant:"outline",children:"Bottom"})}),t.jsx(e,{content:"Left tooltip",position:"left",children:t.jsx(o,{variant:"outline",children:"Left"})}),t.jsx(e,{content:"Right tooltip",position:"right",children:t.jsx(o,{variant:"outline",children:"Right"})})]})},n={args:{content:"You will not see this",disabled:!0,children:t.jsx(o,{variant:"ghost",children:"Disabled tooltip"})}},s={args:{content:"Delayed tooltip (500ms)",delay:500,children:t.jsx(o,{children:"Wait for it..."})}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    content: 'This is a tooltip',
    children: <Button>Hover me</Button>
  }
}`,...i.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '2rem',
    padding: '3rem',
    justifyContent: 'center'
  }}>\r
      <Tooltip content="Top tooltip" position="top">\r
        <Button variant="outline">Top</Button>\r
      </Tooltip>\r
      <Tooltip content="Bottom tooltip" position="bottom">\r
        <Button variant="outline">Bottom</Button>\r
      </Tooltip>\r
      <Tooltip content="Left tooltip" position="left">\r
        <Button variant="outline">Left</Button>\r
      </Tooltip>\r
      <Tooltip content="Right tooltip" position="right">\r
        <Button variant="outline">Right</Button>\r
      </Tooltip>\r
    </div>
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    content: 'You will not see this',
    disabled: true,
    children: <Button variant="ghost">Disabled tooltip</Button>
  }
}`,...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    content: 'Delayed tooltip (500ms)',
    delay: 500,
    children: <Button>Wait for it...</Button>
  }
}`,...s.parameters?.docs?.source}}};const R=["Default","Positions","Disabled","CustomDelay"];export{s as CustomDelay,i as Default,n as Disabled,r as Positions,R as __namedExportsOrder,L as default};
