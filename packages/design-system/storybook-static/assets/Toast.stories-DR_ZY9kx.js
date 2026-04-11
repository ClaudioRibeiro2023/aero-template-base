import{j as e}from"./jsx-runtime-CSjhXfFz.js";import{r as a}from"./index-BxY4JGwq.js";import{c as I}from"./clsx-B-dksMZM.js";/* empty css              */import{I as k}from"./info-hi-Wa6va.js";import{A as E}from"./alert-triangle-C2XFMsst.js";import{c as P}from"./createLucideIcon-DA4OzSxG.js";import{C as W}from"./check-circle-CO1UfONf.js";import{X as q}from"./x-lWMTmhcP.js";import{B as p}from"./Button-BNyMHqOH.js";import"./_commonjsHelpers-CqkleIqs.js";/* empty css               */const V=P("AlertCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]),A={success:W,error:V,warning:E,info:k};function l({id:t,type:d,title:c,message:n,duration:i=5e3,onClose:s}){const[u,m]=a.useState(!1),C=A[d];a.useEffect(()=>{if(i>0){const w=setTimeout(()=>{m(!0),setTimeout(s,200)},i);return()=>clearTimeout(w)}},[i,s]);const _=()=>{m(!0),setTimeout(s,200)};return e.jsxs("div",{className:I("ds-toast",`ds-toast--${d}`,u&&"ds-toast--exiting"),role:"alert","aria-live":"polite",children:[e.jsx("div",{className:"ds-toast__icon",children:e.jsx(C,{size:20})}),e.jsxs("div",{className:"ds-toast__content",children:[c&&e.jsx("div",{className:"ds-toast__title",children:c}),e.jsx("div",{className:"ds-toast__message",children:n})]}),e.jsx("button",{type:"button",onClick:_,className:"ds-toast__close","aria-label":"Fechar notificação",children:e.jsx(q,{size:16})}),i>0&&e.jsx("div",{className:"ds-toast__progress",style:{animationDuration:`${i}ms`},"aria-hidden":"true"})]})}function j({toasts:t,position:d="top-right",onRemove:c}){return e.jsx("div",{className:I("ds-toast-container",`ds-toast-container--${d}`),"aria-live":"polite",role:"status",children:t.map(n=>e.jsx(l,{...n,onClose:()=>c(n.id)},n.id))})}const N=a.createContext(null);function S({children:t,position:d="top-right",maxToasts:c=5}){const[n,i]=a.useState([]),s=a.useCallback(o=>{const r=`toast-${Date.now()}-${Math.random().toString(36).substr(2,9)}`;return i(b=>[...b,{...o,id:r}].slice(-c)),r},[c]),u=a.useCallback(o=>{i(r=>r.filter(b=>b.id!==o))},[]),m=a.useCallback((o,r)=>s({type:"success",message:o,title:r}),[s]),C=a.useCallback((o,r)=>s({type:"error",message:o,title:r}),[s]),_=a.useCallback((o,r)=>s({type:"warning",message:o,title:r}),[s]),w=a.useCallback((o,r)=>s({type:"info",message:o,title:r}),[s]);return e.jsxs(N.Provider,{value:{toasts:n,addToast:s,removeToast:u,success:m,error:C,warning:_,info:w},children:[t,e.jsx(j,{toasts:n,position:d,onRemove:u})]})}function $(){const t=a.useContext(N);if(!t)throw new Error("useToast must be used within a ToastProvider");return t}try{l.displayName="ToastItem",l.__docgenInfo={description:"",displayName:"ToastItem",props:{onClose:{defaultValue:null,description:"",name:"onClose",required:!0,type:{name:"() => void"}},id:{defaultValue:null,description:"",name:"id",required:!0,type:{name:"string"}},type:{defaultValue:null,description:"",name:"type",required:!0,type:{name:"enum",value:[{value:'"success"'},{value:'"warning"'},{value:'"error"'},{value:'"info"'}]}},title:{defaultValue:null,description:"",name:"title",required:!1,type:{name:"string"}},message:{defaultValue:null,description:"",name:"message",required:!0,type:{name:"string"}},duration:{defaultValue:{value:"5000"},description:"",name:"duration",required:!1,type:{name:"number"}}}}}catch{}try{j.displayName="ToastContainer",j.__docgenInfo={description:"",displayName:"ToastContainer",props:{toasts:{defaultValue:null,description:"",name:"toasts",required:!0,type:{name:"Toast[]"}},position:{defaultValue:{value:"top-right"},description:"",name:"position",required:!1,type:{name:"enum",value:[{value:'"top-right"'},{value:'"top-left"'},{value:'"bottom-right"'},{value:'"bottom-left"'},{value:'"top-center"'},{value:'"bottom-center"'}]}},onRemove:{defaultValue:null,description:"",name:"onRemove",required:!0,type:{name:"(id: string) => void"}}}}}catch{}try{S.displayName="ToastProvider",S.__docgenInfo={description:"",displayName:"ToastProvider",props:{position:{defaultValue:{value:"top-right"},description:"",name:"position",required:!1,type:{name:"enum",value:[{value:'"top-right"'},{value:'"top-left"'},{value:'"bottom-right"'},{value:'"bottom-left"'},{value:'"top-center"'},{value:'"bottom-center"'}]}},maxToasts:{defaultValue:{value:"5"},description:"",name:"maxToasts",required:!1,type:{name:"number"}}}}}catch{}const Q={title:"Components/Toast",component:l,tags:["autodocs"],argTypes:{type:{control:"select",options:["success","error","warning","info"]}}},g={args:{id:"1",type:"success",title:"Success",message:"Your changes have been saved successfully.",onClose:()=>{},duration:0}},f={args:{id:"2",type:"error",title:"Error",message:"Something went wrong. Please try again.",onClose:()=>{},duration:0}},y={args:{id:"3",type:"warning",title:"Warning",message:"Your session is about to expire.",onClose:()=>{},duration:0}},v={args:{id:"4",type:"info",title:"Info",message:"A new version is available for download.",onClose:()=>{},duration:0}},x={args:{id:"5",type:"info",message:"Simple notification without a title.",onClose:()=>{},duration:0}},h={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"0.75rem",maxWidth:"400px"},children:[e.jsx(l,{id:"1",type:"success",title:"Success",message:"Operation completed.",onClose:()=>{},duration:0}),e.jsx(l,{id:"2",type:"error",title:"Error",message:"Something went wrong.",onClose:()=>{},duration:0}),e.jsx(l,{id:"3",type:"warning",title:"Warning",message:"Proceed with caution.",onClose:()=>{},duration:0}),e.jsx(l,{id:"4",type:"info",title:"Info",message:"New updates available.",onClose:()=>{},duration:0})]})};function z(){const t=$();return e.jsxs("div",{style:{display:"flex",gap:"0.5rem",flexWrap:"wrap"},children:[e.jsx(p,{variant:"primary",size:"sm",onClick:()=>t.success("Saved!","Success"),children:"Success Toast"}),e.jsx(p,{variant:"danger",size:"sm",onClick:()=>t.error("Failed to save.","Error"),children:"Error Toast"}),e.jsx(p,{variant:"outline",size:"sm",onClick:()=>t.warning("Session expiring.","Warning"),children:"Warning Toast"}),e.jsx(p,{variant:"secondary",size:"sm",onClick:()=>t.info("Version 2.0 released.","Info"),children:"Info Toast"})]})}const T={render:()=>e.jsx(S,{position:"top-right",maxToasts:5,children:e.jsx(z,{})})};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    id: '1',
    type: 'success',
    title: 'Success',
    message: 'Your changes have been saved successfully.',
    onClose: () => {},
    duration: 0
  }
}`,...g.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    id: '2',
    type: 'error',
    title: 'Error',
    message: 'Something went wrong. Please try again.',
    onClose: () => {},
    duration: 0
  }
}`,...f.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    id: '3',
    type: 'warning',
    title: 'Warning',
    message: 'Your session is about to expire.',
    onClose: () => {},
    duration: 0
  }
}`,...y.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    id: '4',
    type: 'info',
    title: 'Info',
    message: 'A new version is available for download.',
    onClose: () => {},
    duration: 0
  }
}`,...v.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    id: '5',
    type: 'info',
    message: 'Simple notification without a title.',
    onClose: () => {},
    duration: 0
  }
}`,...x.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    maxWidth: '400px'
  }}>\r
      <ToastItem id="1" type="success" title="Success" message="Operation completed." onClose={() => {}} duration={0} />\r
      <ToastItem id="2" type="error" title="Error" message="Something went wrong." onClose={() => {}} duration={0} />\r
      <ToastItem id="3" type="warning" title="Warning" message="Proceed with caution." onClose={() => {}} duration={0} />\r
      <ToastItem id="4" type="info" title="Info" message="New updates available." onClose={() => {}} duration={0} />\r
    </div>
}`,...h.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => <ToastProvider position="top-right" maxToasts={5}>\r
      <ToastPlayground />\r
    </ToastProvider>
}`,...T.parameters?.docs?.source}}};const U=["Success","Error","Warning","Info","WithoutTitle","AllTypes","Interactive"];export{h as AllTypes,f as Error,v as Info,T as Interactive,g as Success,y as Warning,x as WithoutTitle,U as __namedExportsOrder,Q as default};
