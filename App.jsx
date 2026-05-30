import { useState, useEffect, useRef, createContext, useContext } from "react"
import { supabase } from "./supabase.js"

/* ── PUSH NOTIFICATIONS ── */
const requestPushPermission = async () => {
  if (!("Notification" in window)) return false
  if (Notification.permission === "granted") return true
  if (Notification.permission === "denied") return false
  const perm = await Notification.requestPermission()
  return perm === "granted"
}
const sendPushNotification = (title, body) => {
  if (Notification.permission !== "granted") return
  new Notification(title, { body, icon: "/moon.svg", tag: "luna-care-response" })
}

/* ── TOKENS ── */
const C = {
  bg:"#FAFAF8", surface:"#FFFFFF", card:"#F5F3F0", border:"#EBEBEB",
  ink:"#1A1814", inkMid:"#6B6560", inkSoft:"#A8A29E",
  rose:"#C9837A", roseSoft:"#F5EDEB", roseMid:"#E8C4BF",
  sage:"#7A9E8E", sageSoft:"#EBF2EE", sageMid:"#BDD5CB",
  teal:"#5BA8A0", tealSoft:"#EAF4F3", tealMid:"#B2D8D4",
  sand:"#D4B896", sandSoft:"#FAF5EF", sandMid:"#EDE0D0",
  warn:"#D97B4F", warnSoft:"#FBF0EB",
  error:"#C0392B", errorSoft:"#FDEBE8",
  green:"#5A9E6F", greenSoft:"#EAF4EE", greenMid:"#BDD5C8",
  gold:"#C8A96E", goldSoft:"#FAF3E8",
}
const F = { d:"'Cormorant Garant',serif", u:"'Outfit',sans-serif" }

/* ── AUTH CONTEXT ── */
const AuthCtx = createContext(null)
const useAuth = () => useContext(AuthCtx)

function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [doctor,  setDoctor]  = useState(null)
  const [ready,   setReady]   = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchUserData(session.user.id)
      else setReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchUserData(session.user.id)
      else { setProfile(null); setDoctor(null); setReady(true) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const fetchUserData = async (uid) => {
    const [{ data: p }, { data: d }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).single(),
      supabase.from("doctors").select("*").eq("id", uid).single(),
    ])
    setProfile(p)
    setDoctor(d)
    setReady(true)
  }

  const updateProfile = async (updates) => {
    const { data, error } = await supabase.from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", user.id).select().single()
    if (!error) setProfile(data)
    return { data, error }
  }

  const refreshDoctor = async () => {
    if (!user) return
    const { data } = await supabase.from("doctors").select("*").eq("id", user.id).single()
    setDoctor(data)
  }

  const signOut = async () => { await supabase.auth.signOut() }
  const isDoctor = !!doctor
  const role = doctor ? "doctor" : "patient"

  return (
    <AuthCtx.Provider value={{ user, profile, doctor, ready, role, isDoctor, updateProfile, refreshDoctor, signOut }}>
      {children}
    </AuthCtx.Provider>
  )
}

/* ── ICONS ── */
const Moon  = ({s=18,c=C.rose})    => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
const Back  = ({s=18,c=C.inkSoft}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M19 12H5M11 6l-6 6 6 6" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
const Arrow = ({s=14,c="#fff"})    => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M5 12h14M13 6l6 6-6 6" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
const Shield= ({s=14,c=C.sage})   => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/></svg>
const Check = ({s=16,c=C.sage})   => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><circle cx="12" cy="12" r="10" stroke={c} strokeWidth="1.5"/><path d="M8 12l3 3 5-5" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
const Video = ({s=14,c=C.teal})   => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.723v6.554a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
const Mail  = ({s=18,c=C.rose})   => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={c} strokeWidth="1.5"/><polyline points="22,6 12,13 2,6" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>
const Spark = ({s=14,c=C.teal})   => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="12" r="3" stroke={c} strokeWidth="1.5"/></svg>
const Star  = ({s=14,c=C.gold})   => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} style={{flexShrink:0}}><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
const Logout= ({s=16,c=C.error})  => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>

/* ── SHARED UI ── */
const Shell = ({children}) => (
  <div style={{width:"100%",maxWidth:430,minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",boxShadow:"0 0 60px rgba(0,0,0,0.12)"}}>
    {children}
  </div>
)
const NavBar = ({title,onBack,subtitle,right}) => (
  <div style={{padding:"14px 22px 12px",background:C.surface,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
    {onBack && <button onClick={onBack} style={{flexShrink:0}}><Back/></button>}
    <div style={{flex:1}}>
      {subtitle && <div style={{fontFamily:F.u,fontSize:10,color:C.rose,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:1}}>{subtitle}</div>}
      <div style={{fontFamily:F.d,fontSize:20,fontWeight:600,color:C.ink,lineHeight:1.1}}>{title}</div>
    </div>
    {right}
  </div>
)
const Btn = ({label,onClick,disabled=false,bg=C.ink,color="#fff",loading=false,full=true}) => (
  <button onClick={onClick} disabled={disabled||loading}
    style={{width:full?"100%":"auto",padding:"15px",borderRadius:16,background:disabled||loading?C.border:bg,color:disabled||loading?C.inkSoft:color,fontFamily:F.u,fontWeight:600,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",gap:10,transition:"all .2s",border:"none",cursor:disabled||loading?"not-allowed":"pointer"}}>
    {loading && <div className="spin" style={{width:16,height:16,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.3)",borderTopColor:color}}/>}
    {label}
  </button>
)
const GhostBtn = ({label,onClick}) => (
  <button onClick={onClick} style={{width:"100%",padding:"14px",borderRadius:16,border:`1.5px solid ${C.border}`,background:"transparent",color:C.inkMid,fontFamily:F.u,fontWeight:500,fontSize:14,cursor:"pointer"}}>
    {label}
  </button>
)
const ErrMsg = ({msg}) => msg ? (
  <div style={{background:C.errorSoft,border:`1px solid #F5C0B8`,borderRadius:12,padding:"11px 14px",marginBottom:14,display:"flex",gap:8,alignItems:"flex-start"}}>
    <span style={{fontSize:14,flexShrink:0}}>⚠️</span>
    <span style={{fontFamily:F.u,fontSize:12,color:C.error,lineHeight:1.5}}>{msg}</span>
  </div>
) : null
const OkMsg = ({msg}) => msg ? (
  <div style={{background:C.greenSoft,border:`1px solid ${C.greenMid}`,borderRadius:12,padding:"11px 14px",marginBottom:14,display:"flex",gap:8,alignItems:"center"}}>
    <span style={{fontSize:14}}>✅</span>
    <span style={{fontFamily:F.u,fontSize:12,color:C.green,lineHeight:1.4}}>{msg}</span>
  </div>
) : null
const Divider = ({my=14}) => <div style={{height:1,background:C.border,margin:`${my}px 0`}}/>
const Loader = ({msg="Loading…"}) => (
  <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,padding:32}}>
    <div style={{width:64,height:64,borderRadius:"50%",background:C.roseSoft,border:`1.5px solid ${C.roseMid}`,display:"flex",alignItems:"center",justifyContent:"center"}}><Moon s={30}/></div>
    <div className="spin" style={{width:32,height:32,borderRadius:"50%",border:`3px solid ${C.roseMid}`,borderTopColor:C.rose}}/>
    <span style={{fontFamily:F.u,fontSize:13,color:C.inkSoft,textAlign:"center",lineHeight:1.6}}>{msg}</span>
  </div>
)

/* ════════ WELCOME ════════ */
function Welcome({onRegister, onLogin}) {
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column"}}>
      <div style={{background:C.sandSoft,padding:"56px 32px 40px",borderBottom:`1px solid ${C.sandMid}`,display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div className="fu" style={{width:80,height:80,borderRadius:"50%",background:C.surface,border:`1.5px solid ${C.roseMid}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:24,boxShadow:"0 6px 24px rgba(200,130,120,0.14)"}}><Moon s={38}/></div>
        <div className="fu d1" style={{fontFamily:F.d,fontSize:38,fontWeight:600,color:C.ink,textAlign:"center",lineHeight:1.1}}>Luna Care</div>
        <div className="fu d2" style={{fontFamily:F.u,fontSize:14,color:C.inkMid,marginTop:10,textAlign:"center",lineHeight:1.6}}>Private reproductive health guidance,<br/>always with you.</div>
      </div>
      <div style={{flex:1,padding:"32px 28px 0",overflowY:"auto"}}>
        {[
          {icon:<Shield s={15}/>,          bg:C.sageSoft, text:"100% anonymous — professionals never see your name"},
          {icon:<Check s={15}/>,           bg:C.sageSoft, text:"MDCN-verified healthcare professionals"},
          {icon:<Video s={15}/>,           bg:C.tealSoft, text:"Telehealth video consultations available"},
          {icon:<Mail s={15}/>,            bg:C.roseSoft, text:"Sign in securely with your email"},
        ].map((item,i) => (
          <div key={i} className={`fu d${i+2}`} style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
            <div style={{width:36,height:36,borderRadius:11,background:item.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{item.icon}</div>
            <span style={{fontFamily:F.u,fontSize:14,color:C.ink,lineHeight:1.4}}>{item.text}</span>
          </div>
        ))}
        <Divider my={24}/>
        <div className="fu d6">
          <Btn label="Create account" onClick={onRegister}/>
          <div style={{height:14}}/>
          <GhostBtn label="I already have an account" onClick={onLogin}/>
        </div>
      </div>
      <p style={{fontFamily:F.u,fontSize:11,color:C.inkSoft,textAlign:"center",padding:"20px 28px",lineHeight:1.6}}>This app does not replace professional medical care.</p>
    </div>
  )
}

/* ════════ ROLE SELECT ════════ */
function RoleSelect({onBack, onPatient, onDoctor}) {
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <NavBar title="Create account" onBack={onBack}/>
      <div style={{flex:1,overflowY:"auto",padding:"28px 24px"}}>
        <div className="fu" style={{fontFamily:F.d,fontSize:28,fontWeight:600,color:C.ink,lineHeight:1.2,marginBottom:8}}>Who are you?</div>
        <p className="fu d1" style={{fontFamily:F.u,fontSize:14,color:C.inkMid,marginBottom:32,lineHeight:1.6}}>Choose the account type that fits you best.</p>

        <div className="fu d2" onClick={onPatient}
          style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:20,padding:"22px",marginBottom:14,cursor:"pointer",transition:"all .2s",display:"flex",gap:16,alignItems:"center"}}>
          <div style={{width:52,height:52,borderRadius:16,background:C.roseSoft,border:`1.5px solid ${C.roseMid}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>🌙</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:F.d,fontSize:22,fontWeight:600,color:C.ink,marginBottom:4}}>I'm a Patient</div>
            <div style={{fontFamily:F.u,fontSize:13,color:C.inkMid,lineHeight:1.5}}>Ask anonymous reproductive health questions and get guidance from verified doctors.</div>
          </div>
          <Arrow s={16} c={C.inkSoft}/>
        </div>

        <div className="fu d3" onClick={onDoctor}
          style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:20,padding:"22px",marginBottom:28,cursor:"pointer",transition:"all .2s",display:"flex",gap:16,alignItems:"center"}}>
          <div style={{width:52,height:52,borderRadius:16,background:C.tealSoft,border:`1.5px solid ${C.tealMid}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>🩺</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:F.d,fontSize:22,fontWeight:600,color:C.ink,marginBottom:4}}>I'm a Doctor</div>
            <div style={{fontFamily:F.u,fontSize:13,color:C.inkMid,lineHeight:1.5}}>Join as an MDCN-verified professional. Answer questions and earn income.</div>
          </div>
          <Arrow s={16} c={C.inkSoft}/>
        </div>

        <div style={{background:C.sageSoft,border:`1px solid ${C.sageMid}`,borderRadius:14,padding:"12px 14px",display:"flex",gap:9,alignItems:"center"}}>
          <Shield s={13}/>
          <span style={{fontFamily:F.u,fontSize:12,color:C.sage,lineHeight:1.4}}>All accounts are private and NDPR compliant.</span>
        </div>
      </div>
    </div>
  )
}

/* ════════ PATIENT REGISTER ════════ */
function Register({onBack, onSent}) {
  const [name,   setName]   = useState("")
  const [email,  setEmail]  = useState("")
  const [dob,    setDob]    = useState("")
  const [agreed, setAgreed] = useState(false)
  const [loading,setLoading]= useState(false)
  const [err,    setErr]    = useState("")
  const valid = name.trim().length>1 && email.includes("@") && email.includes(".") && dob && agreed

  const send = async () => {
    setLoading(true); setErr("")
    const { error: e } = await supabase.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { shouldCreateUser: true } })
    if (e) { setErr(e.message); setLoading(false); return }
    onSent({ name, email: email.trim().toLowerCase(), dob, isDoctor: false })
    setLoading(false)
  }

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <NavBar title="Patient Account" subtitle="Step 1 of 2" onBack={onBack}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
        <div className="fu" style={{background:C.sageSoft,border:`1px solid ${C.sageMid}`,borderRadius:14,padding:"12px 14px",marginBottom:22,display:"flex",gap:9,alignItems:"center"}}>
          <Shield s={15}/><span style={{fontFamily:F.u,fontSize:12,color:C.sage,lineHeight:1.4}}>Your name is <strong>never shared</strong> with healthcare professionals.</span>
        </div>
        <ErrMsg msg={err}/>
        {[
          {label:"Full name",     ph:"e.g. Amara Okafor",  val:name,  set:setName,  icon:"👤", type:"text"},
          {label:"Email address", ph:"you@example.com",    val:email, set:setEmail, icon:"✉️", type:"email"},
          {label:"Date of birth", ph:"",                   val:dob,   set:setDob,   icon:"📅", type:"date"},
        ].map((f,i) => (
          <div key={f.label} className={`fu d${i+1}`} style={{marginBottom:18}}>
            <label style={{display:"block",fontFamily:F.u,fontSize:10.5,fontWeight:600,color:C.inkSoft,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:8}}>{f.label}</label>
            <div style={{display:"flex",alignItems:"center",gap:10,background:C.surface,border:`1.5px solid ${f.val.length>0?C.roseMid:C.border}`,borderRadius:14,padding:"14px 16px",transition:"border-color .2s"}}>
              <span style={{fontSize:16,flexShrink:0}}>{f.icon}</span>
              <input type={f.type} placeholder={f.ph} value={f.val} onChange={e=>f.set(e.target.value)} style={{flex:1,fontFamily:F.u,fontSize:14,color:C.ink,background:"transparent"}}/>
            </div>
          </div>
        ))}
        <div className="fu d4" onClick={()=>setAgreed(a=>!a)} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:28,cursor:"pointer"}}>
          <div style={{width:22,height:22,borderRadius:7,background:agreed?C.ink:C.surface,border:`1.5px solid ${agreed?C.ink:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,transition:"all .2s"}}>
            {agreed && <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
          <span style={{fontFamily:F.u,fontSize:13,color:C.inkMid,lineHeight:1.55}}>I agree to the <span style={{color:C.rose,fontWeight:500}}>Privacy Policy</span> and understand this app does not replace professional medical advice.</span>
        </div>
        <Btn label="Send verification code →" onClick={send} disabled={!valid} loading={loading}/>
        <p style={{fontFamily:F.u,fontSize:11,color:C.inkSoft,textAlign:"center",marginTop:14}}>A 6-digit code will be sent to your email.</p>
      </div>
    </div>
  )
}

/* ════════ DOCTOR REGISTER ════════ */
function DoctorRegister({onBack, onSent}) {
  const [form, setForm] = useState({fullName:"",email:"",phone:"",specialty:"",mdcn:"",experience:""})
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const specialties = ["Obstetrics & Gynaecology","Reproductive Endocrinology","General Practice","Family Medicine","Paediatrics","Urology","Endocrinology","Internal Medicine","Psychiatry","Other"]
  const valid = form.fullName.trim().length>2 && form.email.includes("@") && form.specialty && form.mdcn.trim().length>4

  const send = async () => {
    setLoading(true); setErr("")
    const { error: e } = await supabase.auth.signInWithOtp({ email: form.email.trim().toLowerCase(), options: { shouldCreateUser: true } })
    if (e) { setErr(e.message); setLoading(false); return }
    onSent({ ...form, isDoctor: true })
    setLoading(false)
  }

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <NavBar title="Doctor Application" subtitle="Step 1 of 2" onBack={onBack}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
        <div className="fu" style={{background:C.tealSoft,border:`1px solid ${C.tealMid}`,borderRadius:14,padding:"12px 14px",marginBottom:20,display:"flex",gap:9,alignItems:"center"}}>
          <Shield s={13} c={C.teal}/><span style={{fontFamily:F.u,fontSize:12,color:C.teal,lineHeight:1.4}}>Reviewed within <strong>48 hours</strong>. MDCN number required.</span>
        </div>
        <ErrMsg msg={err}/>
        <div style={{fontFamily:F.u,fontSize:10,fontWeight:700,color:C.inkSoft,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:14}}>Personal Information</div>
        {[
          {label:"Full name",ph:"Dr. Amara Okafor",val:form.fullName,k:"fullName",icon:"👤",type:"text"},
          {label:"Email",ph:"doctor@email.com",val:form.email,k:"email",icon:"✉️",type:"email"},
          {label:"Phone",ph:"+234 801 234 5678",val:form.phone,k:"phone",icon:"📱",type:"tel"},
        ].map((f,i)=>(
          <div key={f.k} className={`fu d${i+1}`} style={{marginBottom:14}}>
            <label style={{display:"block",fontFamily:F.u,fontSize:10,fontWeight:600,color:C.inkSoft,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:7}}>{f.label}</label>
            <div style={{display:"flex",alignItems:"center",gap:10,background:C.surface,border:`1.5px solid ${f.val.length>0?C.tealMid:C.border}`,borderRadius:14,padding:"13px 16px",transition:"border-color .2s"}}>
              <span style={{fontSize:15,flexShrink:0}}>{f.icon}</span>
              <input type={f.type} placeholder={f.ph} value={f.val} onChange={e=>set(f.k,e.target.value)} style={{flex:1,fontFamily:F.u,fontSize:14,color:C.ink,background:"transparent"}}/>
            </div>
          </div>
        ))}
        <div style={{fontFamily:F.u,fontSize:10,fontWeight:700,color:C.inkSoft,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:14,marginTop:8}}>Professional Details</div>
        <div className="fu d4" style={{marginBottom:14}}>
          <label style={{display:"block",fontFamily:F.u,fontSize:10,fontWeight:600,color:C.inkSoft,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:7}}>Specialty <span style={{color:C.rose}}>*</span></label>
          <div style={{position:"relative"}}>
            <select value={form.specialty} onChange={e=>set("specialty",e.target.value)}
              style={{width:"100%",background:C.surface,border:`1.5px solid ${form.specialty?C.tealMid:C.border}`,borderRadius:14,padding:"13px 16px",fontFamily:F.u,fontSize:14,color:form.specialty?C.ink:C.inkSoft,appearance:"none",cursor:"pointer"}}>
              <option value="">Select specialty</option>
              {specialties.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",color:C.inkSoft,pointerEvents:"none",fontSize:12}}>▾</span>
          </div>
        </div>
        <div className="fu d5" style={{marginBottom:14}}>
          <label style={{display:"block",fontFamily:F.u,fontSize:10,fontWeight:600,color:C.inkSoft,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:7}}>MDCN Number <span style={{color:C.rose}}>*</span></label>
          <div style={{display:"flex",alignItems:"center",gap:10,background:C.surface,border:`1.5px solid ${form.mdcn.length>0?C.tealMid:C.border}`,borderRadius:14,padding:"13px 16px",transition:"border-color .2s"}}>
            <Shield s={14} c={C.teal}/><input type="text" placeholder="e.g. MD/2018/12345" value={form.mdcn} onChange={e=>set("mdcn",e.target.value)} style={{flex:1,fontFamily:F.u,fontSize:14,color:C.ink,background:"transparent"}}/>
          </div>
        </div>
        <div className="fu d6" style={{marginBottom:24}}>
          <label style={{display:"block",fontFamily:F.u,fontSize:10,fontWeight:600,color:C.inkSoft,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:7}}>Years of Experience</label>
          <div style={{display:"flex",alignItems:"center",gap:10,background:C.surface,border:`1.5px solid ${form.experience.length>0?C.tealMid:C.border}`,borderRadius:14,padding:"13px 16px",transition:"border-color .2s"}}>
            <span style={{fontSize:15}}>🏥</span><input type="number" placeholder="e.g. 8" value={form.experience} onChange={e=>set("experience",e.target.value)} style={{flex:1,fontFamily:F.u,fontSize:14,color:C.ink,background:"transparent"}}/>
          </div>
        </div>
        <Btn label={loading?"Sending code…":"Continue →"} onClick={send} disabled={!valid} loading={loading} bg={C.teal} color="#fff"/>
        <p style={{fontFamily:F.u,fontSize:11,color:C.inkSoft,textAlign:"center",marginTop:14}}>A 6-digit code will be sent to your email.</p>
      </div>
    </div>
  )
}

/* ════════ LOGIN ════════ */
function Login({onBack, onSent}) {
  const [email,  setEmail]  = useState("")
  const [loading,setLoading]= useState(false)
  const [err,    setErr]    = useState("")

  const send = async () => {
    setLoading(true); setErr("")
    const { error: e } = await supabase.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { shouldCreateUser: false } })
    if (e) { setErr(e.message); setLoading(false); return }
    onSent({ email: email.trim().toLowerCase() })
    setLoading(false)
  }

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",padding:"0 24px 32px"}}>
      <div style={{padding:"16px 0 24px",display:"flex",alignItems:"center",gap:14}}>
        <button onClick={onBack}><Back/></button>
        <div style={{fontFamily:F.d,fontSize:20,fontWeight:600,color:C.ink}}>Welcome back</div>
      </div>
      <div className="fu" style={{width:68,height:68,borderRadius:"50%",background:C.roseSoft,border:`1.5px solid ${C.roseMid}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:22,alignSelf:"center"}}><Moon s={32}/></div>
      <div className="fu d1" style={{fontFamily:F.d,fontSize:30,fontWeight:600,color:C.ink,textAlign:"center",marginBottom:8}}>Sign in to Luna Care</div>
      <p className="fu d2" style={{fontFamily:F.u,fontSize:13,color:C.inkMid,textAlign:"center",marginBottom:32,lineHeight:1.55}}>Enter your email — we'll send you a secure 6-digit code.</p>
      <ErrMsg msg={err}/>
      <div className="fu d3" style={{marginBottom:24}}>
        <label style={{display:"block",fontFamily:F.u,fontSize:10.5,fontWeight:600,color:C.inkSoft,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:8}}>Email address</label>
        <div style={{display:"flex",alignItems:"center",gap:10,background:C.surface,border:`1.5px solid ${email.includes("@")?C.roseMid:C.border}`,borderRadius:14,padding:"14px 16px"}}>
          <Mail s={16}/><input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&email.includes("@")&&send()}
            style={{flex:1,fontFamily:F.u,fontSize:14,color:C.ink,background:"transparent"}}/>
        </div>
      </div>
      <Btn label="Send login code →" onClick={send} disabled={!email.includes("@")||!email.includes(".")} loading={loading}/>
    </div>
  )
}

/* ════════ OTP ════════ */
function OTP({userData, onBack, onDone}) {
  const [otp,     setOtp]    = useState(["","","","","",""])
  const [seconds, setSeconds]= useState(59)
  const [loading, setLoading]= useState(false)
  const [err,     setErr]    = useState("")
  const [ok,      setOk]     = useState("")
  const refs = useRef([])

  useEffect(()=>{
    refs.current[0]?.focus()
    if(seconds<=0)return
    const t=setTimeout(()=>setSeconds(s=>s-1),1000)
    return()=>clearTimeout(t)
  },[seconds])

  const key=(i,val)=>{
    if(!/^\d?$/.test(val))return
    const n=[...otp];n[i]=val;setOtp(n)
    if(val&&i<5)refs.current[i+1]?.focus()
    if(!val&&i>0)refs.current[i-1]?.focus()
  }

  const verify=async()=>{
    const token=otp.join("")
    if(token.length<6)return
    setLoading(true);setErr("")
    const{data,error:e}=await supabase.auth.verifyOtp({email:userData.email,token,type:"email"})
    if(e){setErr("Incorrect code — please try again.");setLoading(false);setOtp(["","","","","",""]);setTimeout(()=>refs.current[0]?.focus(),50);return}
    // Create doctor or patient record
    if(userData.isDoctor){
      await supabase.from("doctors").upsert({
        id:data.user.id, full_name:userData.fullName, email:userData.email,
        phone:userData.phone||null, specialty:userData.specialty,
        mdcn_number:userData.mdcn, years_experience:parseInt(userData.experience)||0,
        status:"pending",
      },{onConflict:"id"})
    } else if(userData.name){
      await supabase.from("profiles").update({
        full_name:userData.name, date_of_birth:userData.dob||null, updated_at:new Date().toISOString()
      }).eq("id",data.user.id)
    }
    setOk("✓ Verified!")
    setTimeout(()=>onDone(),900)
  }

  const filled=otp.every(d=>d!=="")

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",padding:"0 24px 32px"}}>
      <div style={{padding:"16px 0 20px",display:"flex",alignItems:"center",gap:14}}>
        <button onClick={onBack}><Back/></button>
        <span style={{fontFamily:F.u,fontSize:10.5,color:userData?.isDoctor?C.teal:C.rose,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase"}}>{userData?.isDoctor?"Doctor Application — Step 2 of 2":userData?.name?"Step 2 of 2":"Sign in"}</span>
      </div>
      <div className="fu" style={{width:72,height:72,borderRadius:"50%",background:userData?.isDoctor?C.tealSoft:C.roseSoft,border:`1.5px solid ${userData?.isDoctor?C.tealMid:C.roseMid}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:22,alignSelf:"center"}}><Mail s={32} c={userData?.isDoctor?C.teal:C.rose}/></div>
      <div className="fu d1" style={{fontFamily:F.d,fontSize:28,fontWeight:600,color:C.ink,textAlign:"center",lineHeight:1.15,marginBottom:10}}>Check your email</div>
      <p className="fu d2" style={{fontFamily:F.u,fontSize:13,color:C.inkMid,textAlign:"center",marginBottom:6}}>6-digit code sent to</p>
      <p className="fu d2" style={{fontFamily:F.u,fontSize:15,fontWeight:600,color:C.ink,textAlign:"center",marginBottom:28}}>{userData?.email}</p>
      <ErrMsg msg={err}/><OkMsg msg={ok}/>
      <div className="fu d3" style={{display:"flex",gap:10,justifyContent:"center",marginBottom:10}}>
        {otp.map((d,i)=>(
          <input key={i} ref={el=>refs.current[i]=el} maxLength={1} value={d}
            onChange={e=>key(i,e.target.value)}
            onKeyDown={e=>{if(e.key==="Backspace"&&!otp[i]&&i>0)refs.current[i-1]?.focus();if(e.key==="Enter"&&filled)verify()}}
            style={{width:46,height:56,borderRadius:14,textAlign:"center",fontFamily:F.d,fontSize:24,fontWeight:600,color:C.ink,background:d?userData?.isDoctor?C.tealSoft:C.roseSoft:C.surface,border:`1.5px solid ${d?userData?.isDoctor?C.tealMid:C.roseMid:C.border}`,transition:"all .15s"}}/>
        ))}
      </div>
      <p style={{fontFamily:F.u,fontSize:11,color:C.inkSoft,textAlign:"center",marginBottom:20}}>Can't find it? Check your spam folder.</p>
      <p style={{fontFamily:F.u,fontSize:12,color:C.inkSoft,textAlign:"center",marginBottom:24}}>
        {seconds>0?<>Resend in <span style={{color:userData?.isDoctor?C.teal:C.rose,fontWeight:600}}>0:{String(seconds).padStart(2,"0")}</span></>:
        <button style={{color:userData?.isDoctor?C.teal:C.rose,fontWeight:600,fontSize:12,fontFamily:F.u,background:"none",border:"none",cursor:"pointer"}} onClick={async()=>{setSeconds(59);await supabase.auth.signInWithOtp({email:userData.email,options:{shouldCreateUser:false}})}}>Resend code</button>}
      </p>
      <Btn label={loading?"Verifying…":"Verify & continue →"} onClick={verify} disabled={!filled} loading={loading} bg={userData?.isDoctor?C.teal:C.ink} color="#fff"/>
      <div style={{height:12}}/><GhostBtn label="← Change email" onClick={onBack}/>
    </div>
  )
}

/* ════════ DOCTOR PENDING ════════ */
function DoctorPending({userData, onSignOut}) {
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px",textAlign:"center"}}>
      <div style={{width:72,height:72,borderRadius:"50%",background:C.tealSoft,border:`1.5px solid ${C.tealMid}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20,fontSize:32}}>🩺</div>
      <div style={{fontFamily:F.d,fontSize:28,fontWeight:600,color:C.ink,marginBottom:10,lineHeight:1.2}}>Application Submitted!</div>
      <p style={{fontFamily:F.u,fontSize:14,color:C.inkMid,lineHeight:1.7,marginBottom:28,maxWidth:320}}>Your application is being reviewed by our team. You'll receive an email within <strong style={{color:C.teal}}>48 hours</strong> once verified.</p>
      <div style={{background:C.tealSoft,border:`1px solid ${C.tealMid}`,borderRadius:14,padding:"14px 18px",marginBottom:28,display:"flex",gap:10,alignItems:"center",textAlign:"left",width:"100%",maxWidth:340}}>
        <span style={{fontSize:18}}>📧</span>
        <span style={{fontFamily:F.u,fontSize:12,color:C.teal,lineHeight:1.5}}>Check <strong>{userData?.email}</strong> for updates on your application.</span>
      </div>
      <button onClick={onSignOut} style={{display:"flex",alignItems:"center",gap:8,fontFamily:F.u,fontSize:13,color:C.inkSoft,background:"none",border:"none",cursor:"pointer"}}>
        <Logout s={14} c={C.inkSoft}/> Sign out
      </button>
    </div>
  )
}

/* ════════ PATIENT BOTTOM NAV ════════ */
const PatientBottomNav = ({active,onNav}) => {
  const items = [
    {id:"home",    label:"Home",    d:"M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"},
    {id:"ask",     label:"Ask",     d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"},
    {id:"history", label:"History", d:"M3 6h18M3 12h18M3 18h12"},
    {id:"profile", label:"Profile", d:"M20 21c0-4-3.6-7-8-7s-8 3-8 7M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"},
  ]
  return(
    <div style={{borderTop:`1px solid ${C.border}`,background:C.surface,display:"flex",padding:"10px 0 4px",flexShrink:0,paddingBottom:"max(4px,env(safe-area-inset-bottom))"}}>
      {items.map(it=>(
        <div key={it.id} onClick={()=>onNav(it.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer"}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{color:it.id===active?C.rose:C.inkSoft}}>
            <path d={it.d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{fontFamily:F.u,fontSize:9.5,fontWeight:it.id===active?600:400,color:it.id===active?C.rose:C.inkSoft}}>{it.label}</span>
          {it.id===active && <div style={{width:16,height:3,borderRadius:99,background:C.rose}}/>}
        </div>
      ))}
    </div>
  )
}

/* ════════ DOCTOR BOTTOM NAV ════════ */
const DoctorBottomNav = ({active,onNav}) => {
  const items = [
    {id:"questions",label:"Questions",d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"},
    {id:"profile",  label:"Profile",  d:"M20 21c0-4-3.6-7-8-7s-8 3-8 7M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"},
  ]
  return(
    <div style={{borderTop:`1px solid ${C.border}`,background:C.surface,display:"flex",padding:"10px 0 4px",flexShrink:0,paddingBottom:"max(4px,env(safe-area-inset-bottom))"}}>
      {items.map(it=>(
        <div key={it.id} onClick={()=>onNav(it.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer"}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{color:it.id===active?C.teal:C.inkSoft}}>
            <path d={it.d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{fontFamily:F.u,fontSize:9.5,fontWeight:it.id===active?600:400,color:it.id===active?C.teal:C.inkSoft}}>{it.label}</span>
          {it.id===active && <div style={{width:16,height:3,borderRadius:99,background:C.teal}}/>}
        </div>
      ))}
    </div>
  )
}

/* ════════ PATIENT HOME ════════ */
function PatientHome({onNav}) {
  const {profile,user}=useAuth()
  const first=profile?.full_name?.split(" ")[0]||""
  const h=new Date().getHours()
  const greet=h<12?"Good morning":h<17?"Good afternoon":"Good evening"
  const topics=[
    {emoji:"🩸",label:"Menstrual",    color:C.rose, bg:C.roseSoft},
    {emoji:"🤰",label:"Pregnancy",    color:C.sage, bg:C.sageSoft},
    {emoji:"💊",label:"Contraception",color:"#B89A6A",bg:C.sandSoft},
    {emoji:"🧬",label:"Reproductive", color:C.rose, bg:C.roseSoft},
    {emoji:"🦠",label:"STIs & STDs",  color:C.warn, bg:C.warnSoft},
    {emoji:"🔬",label:"Fertility",    color:C.sage, bg:C.sageSoft},
  ]

  useEffect(()=>{
    requestPushPermission()
    if(!user)return
    const channel=supabase.channel("q-updates-patient")
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"questions",filter:`user_id=eq.${user.id}`},
        (payload)=>{
          const q=payload.new
          if(q.status==="ai_answered")sendPushNotification("Luna Care 🌙","Your question has received a response.")
          if(q.status==="professional_answered")sendPushNotification("Luna Care 🩺","A verified doctor has responded to your question.")
        }
      ).subscribe()
    return()=>supabase.removeChannel(channel)
  },[user])

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"16px 24px 14px",background:C.surface,borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontFamily:F.u,fontSize:12,color:C.inkSoft,marginBottom:2}}>{greet} 👋</div>
            <div style={{fontFamily:F.d,fontSize:24,color:C.ink,fontWeight:600,lineHeight:1.1}}>{first?`Hello, ${first}`:"How are you feeling?"}</div>
          </div>
          <div style={{width:40,height:40,borderRadius:"50%",background:C.roseSoft,border:`1.5px solid ${C.roseMid}`,display:"flex",alignItems:"center",justifyContent:"center"}}><Moon s={18}/></div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"18px 22px"}}>
        <div onClick={()=>onNav("ask")} style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:18,padding:"14px 16px",marginBottom:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
          <span style={{fontFamily:F.u,fontSize:14,color:C.inkSoft}}>Ask a health question…</span>
          <div style={{width:32,height:32,borderRadius:10,background:C.ink,display:"flex",alignItems:"center",justifyContent:"center"}}><Arrow s={14}/></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:22,paddingLeft:4}}>
          <Shield s={12}/><span style={{fontFamily:F.u,fontSize:11,color:C.sage}}>Your identity is always anonymous</span>
        </div>
        <div style={{background:C.tealSoft,border:`1.5px solid ${C.tealMid}`,borderRadius:20,padding:"16px 18px",marginBottom:24,cursor:"pointer"}} onClick={()=>onNav("ask")}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}><Video s={14}/><span style={{fontFamily:F.u,fontSize:10,fontWeight:700,color:C.teal,textTransform:"uppercase",letterSpacing:"0.06em"}}>Telehealth</span></div>
              <div style={{fontFamily:F.d,fontSize:18,color:C.ink,fontWeight:600,lineHeight:1.2,marginBottom:3}}>Book a video consultation</div>
              <div style={{fontFamily:F.u,fontSize:12,color:C.inkMid}}>Face-to-face with a verified specialist</div>
            </div>
            <div style={{width:34,height:34,borderRadius:11,background:C.teal,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:12}}><Arrow s={14}/></div>
          </div>
          <Divider my={12}/>
          <div style={{display:"flex",gap:14}}>
            {[["⚡","Same-day"],["🔒","Anonymous"],["₦","From ₦5,000"]].map(([ico,lbl])=>(
              <div key={lbl} style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:12}}>{ico}</span><span style={{fontFamily:F.u,fontSize:11,color:C.inkMid}}>{lbl}</span></div>
            ))}
          </div>
        </div>
        <div style={{fontFamily:F.u,fontSize:10,fontWeight:700,color:C.inkSoft,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12}}>Topics</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          {topics.map(t=>(
            <div key={t.label} onClick={()=>onNav("ask")} style={{background:t.bg,borderRadius:16,padding:"14px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:7,cursor:"pointer"}}>
              <span style={{fontSize:22}}>{t.emoji}</span>
              <span style={{fontFamily:F.u,fontSize:10.5,fontWeight:600,color:t.color,textAlign:"center",lineHeight:1.3}}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>
      <PatientBottomNav active="home" onNav={onNav}/>
    </div>
  )
}

/* ════════ ASK ════════ */
function Ask({onBack,onSubmit,defaultTopic=""}) {
  const {user}=useAuth()
  const [topic, setTopic] = useState(defaultTopic)
  const [text,  setText]  = useState("")
  const [urgent,setUrgent]= useState(false)
  const [loading,setLoad] = useState(false)
  const [err,   setErr]   = useState("")
  const [done,  setDone]  = useState(false)
  const topics=["Menstrual 🩸","Pregnancy 🤰","Contraception 💊","Reproductive 🧬","STIs & STDs 🦠","Fertility 🔬"]
  const valid = topic !== "" && text.trim().length >= 10

  const submit=async()=>{
    if(!topic){setErr("Please select a topic before submitting.");return}
    setLoad(true);setErr("")
    const{data,error:e}=await supabase.from("questions").insert({user_id:user.id,topic,content:text,is_urgent:urgent,status:"pending"}).select().single()
    if(e){setErr(e.message);setLoad(false);return}
    setDone(true)
    const base="https://vsahkgegyiqxxzuepnyo.supabase.co/functions/v1"
    const headers={"Content-Type":"application/json"}
    Promise.all([
      fetch(`${base}/answer-question`,{method:"POST",headers,body:JSON.stringify({question_id:data.id,question_content:text,topic})}).catch(()=>{}),
      fetch(`${base}/notify-doctors`,{method:"POST",headers,body:JSON.stringify({question_id:data.id,topic,is_urgent:urgent})}).catch(()=>{})
    ])
    setTimeout(()=>onSubmit(),1400)
  }

  if(done)return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,gap:16}}>
      <div style={{width:72,height:72,borderRadius:"50%",background:C.sageSoft,border:`2px solid ${C.sageMid}`,display:"flex",alignItems:"center",justifyContent:"center"}}><Check s={34}/></div>
      <div style={{fontFamily:F.d,fontSize:26,fontWeight:600,color:C.ink,textAlign:"center",lineHeight:1.2}}>Question submitted!</div>
      <p style={{fontFamily:F.u,fontSize:13,color:C.inkMid,textAlign:"center",lineHeight:1.6,maxWidth:280}}>Your question has been saved anonymously. A verified doctor will review and respond shortly.</p>
      <div className="spin" style={{width:24,height:24,borderRadius:"50%",border:`2px solid ${C.sageMid}`,borderTopColor:C.sage}}/>
    </div>
  )

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <NavBar title="Ask anonymously" onBack={onBack} right={<div style={{display:"flex",alignItems:"center",gap:5}}><Shield s={11}/><span style={{fontFamily:F.u,fontSize:11,color:C.sage}}>Anonymous</span></div>}/>
      <div style={{flex:1,overflowY:"auto",padding:"16px 22px"}}>
        <ErrMsg msg={err}/>
        <div className="fu" style={{marginBottom:18}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{fontFamily:F.u,fontSize:10,fontWeight:700,color:C.inkSoft,letterSpacing:"0.08em",textTransform:"uppercase"}}>Topic</div>
            {!topic&&<span style={{fontFamily:F.u,fontSize:10,color:C.rose,fontWeight:600}}>Required ✱</span>}
          </div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {topics.map(t=>{const n=t.split(" ")[0];const s=topic===n;return(
              <button key={n} onClick={()=>setTopic(n)} style={{padding:"7px 13px",borderRadius:99,fontFamily:F.u,fontSize:12,fontWeight:s?600:400,background:s?C.ink:"transparent",border:`1.5px solid ${s?C.ink:C.border}`,color:s?"#fff":C.inkMid,transition:"all .15s",cursor:"pointer"}}>{t}</button>
            )})}
          </div>
        </div>
        <div className="fu d1" style={{marginBottom:14}}>
          <div style={{fontFamily:F.u,fontSize:10,fontWeight:700,color:C.inkSoft,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>Your question</div>
          <div style={{background:C.surface,border:`1.5px solid ${text.length>0?C.roseMid:C.border}`,borderRadius:16,padding:"14px",position:"relative",transition:"border-color .2s"}}>
            <textarea rows={5} placeholder="Describe your symptoms or ask your health question…" value={text} onChange={e=>setText(e.target.value.slice(0,500))}
              style={{width:"100%",fontFamily:F.u,fontSize:13,color:C.ink,lineHeight:1.6,background:"transparent"}}/>
            <span style={{position:"absolute",bottom:10,right:12,fontFamily:F.u,fontSize:10,color:text.length>420?C.warn:C.inkSoft}}>{text.length}/500</span>
          </div>
        </div>
        <div className="fu d2" onClick={()=>setUrgent(u=>!u)} style={{background:C.warnSoft,border:"1px solid #EDCBBA",borderRadius:13,padding:"12px 14px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
          <div><div style={{fontFamily:F.u,fontSize:13,color:C.ink,fontWeight:600}}>🚨 Flag as urgent</div><div style={{fontFamily:F.u,fontSize:11,color:C.inkMid,marginTop:1}}>Severe pain or heavy bleeding</div></div>
          <div style={{width:42,height:24,borderRadius:99,background:urgent?C.warn:C.border,position:"relative",transition:"background .2s"}}>
            <div style={{position:"absolute",top:2,left:urgent?19:2,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
          </div>
        </div>
        <div className="fu d3" style={{background:C.sageSoft,border:`1px solid ${C.sageMid}`,borderRadius:12,padding:"10px 13px",marginBottom:20,display:"flex",gap:8}}>
          <Shield s={13}/><span style={{fontFamily:F.u,fontSize:12,color:C.sage,lineHeight:1.4}}>Completely anonymous — professionals never see your name.</span>
        </div>
        <Btn label={loading?"Saving…":"Submit question →"} onClick={submit} disabled={!valid} loading={loading}/>
      </div>
    </div>
  )
}

/* ════════ QUESTION DETAIL ════════ */
function QuestionDetail({question:initialQ, onBack, onNewQuestion}) {
  const [q, setQ] = useState(initialQ)
  const [followUp, setFollowUp] = useState("")
  const [sending, setSending] = useState(false)
  const [ok, setOk] = useState("")
  const bottomRef = useRef(null)
  const tC={Contraception:C.rose,Menstrual:C.rose,"STIs & STDs":C.warn,Pregnancy:C.sage,Fertility:C.sage,Reproductive:C.rose}
  const tB={Contraception:C.roseSoft,Menstrual:C.roseSoft,"STIs & STDs":C.warnSoft,Pregnancy:C.sageSoft,Fertility:C.sageSoft,Reproductive:C.roseSoft}
  const isPending=q.status==="pending"
  const isAI=q.status==="ai_answered"
  const isPro=q.status==="professional_answered"
  const messages=Array.isArray(q.thread_messages)?q.thread_messages:[]
  const lastActivity=new Date(q.last_activity_at||q.created_at)
  const hoursAgo=(Date.now()-lastActivity.getTime())/(1000*60*60)
  const shouldAutoClose=!isPending&&!q.thread_closed_at&&hoursAgo>=24
  const isClosed=!!q.thread_closed_at||shouldAutoClose
  const timeLeft=!isPending&&!isClosed?Math.max(0,24-hoursAgo):0
  const hoursLeft=Math.floor(timeLeft)
  const minsLeft=Math.floor((timeLeft-hoursLeft)*60)

  useEffect(()=>{
    const ch=supabase.channel(`q-detail-${q.id}`)
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"questions",filter:`id=eq.${q.id}`},
        p=>setQ(prev=>({...prev,...p.new}))
      ).subscribe()
    return()=>supabase.removeChannel(ch)
  },[q.id])

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"})},[messages.length])

  const sendFollowUp=async()=>{
    if(!followUp.trim())return
    setSending(true)
    const newMsg={role:"patient",content:followUp.trim(),created_at:new Date().toISOString()}
    const updated=[...messages,newMsg]
    const{error}=await supabase.from("questions").update({thread_messages:updated,last_activity_at:new Date().toISOString(),thread_closed_at:null}).eq("id",q.id)
    if(!error){
      setQ(prev=>({...prev,thread_messages:updated,last_activity_at:new Date().toISOString(),thread_closed_at:null}))
      fetch("https://vsahkgegyiqxxzuepnyo.supabase.co/functions/v1/answer-followup",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({question_id:q.id,followup:followUp.trim(),topic:q.topic,original:q.content,ai_response:q.ai_response})
      }).catch(()=>{})
      setFollowUp(""); setOk("Follow-up sent!"); setTimeout(()=>setOk(""),3000)
    }
    setSending(false)
  }

  const reopenThread=async()=>{
    await supabase.from("questions").update({thread_closed_at:null,last_activity_at:new Date().toISOString()}).eq("id",q.id)
    setQ(prev=>({...prev,thread_closed_at:null,last_activity_at:new Date().toISOString()}))
  }

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <NavBar title="Conversation" onBack={onBack}
        right={<span style={{fontFamily:F.u,fontSize:10,fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",
          color:isClosed?"#888":isPro?C.sage:isAI?"#6B8CAE":C.warn,
          background:isClosed?"#F0F0F0":isPro?C.sageSoft:isAI?"#EEF3F8":C.warnSoft,
          padding:"4px 9px",borderRadius:99}}>
          {isClosed?"Closed":isPro?"✓ Answered":isAI?"AI Replied":"⏳ Pending"}
        </span>}/>
      <div style={{flex:1,overflowY:"auto",padding:"16px 22px"}}>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:18,padding:"16px",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <span style={{fontFamily:F.u,fontSize:10,fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",color:tC[q.topic]||C.rose,background:tB[q.topic]||C.roseSoft,padding:"4px 9px",borderRadius:99}}>{q.topic}</span>
            {q.is_urgent&&<span style={{fontFamily:F.u,fontSize:10,fontWeight:600,color:C.warn,background:C.warnSoft,padding:"4px 9px",borderRadius:99}}>🚨 Urgent</span>}
          </div>
          <div style={{fontFamily:F.u,fontSize:10,fontWeight:600,color:C.inkSoft,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Your Question</div>
          <p style={{fontFamily:F.u,fontSize:14,color:C.ink,lineHeight:1.6,margin:0}}>{q.content}</p>
          <div style={{fontFamily:F.u,fontSize:10,color:C.inkSoft,marginTop:8}}>{new Date(q.created_at).toLocaleDateString("en-NG",{day:"numeric",month:"long",year:"numeric"})}</div>
        </div>
        {q.ai_response&&(
          <div style={{background:"#EEF3F8",border:"1px solid #C8D8E8",borderRadius:18,padding:"16px",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <div style={{width:26,height:26,borderRadius:8,background:"#6B8CAE",display:"flex",alignItems:"center",justifyContent:"center"}}><Spark s={12} c="#fff"/></div>
              <div><div style={{fontFamily:F.u,fontSize:11,fontWeight:700,color:"#4A6B8A"}}>AI Health Assistant</div><div style={{fontFamily:F.u,fontSize:10,color:"#7A9AB8"}}>Provisional — not a diagnosis</div></div>
            </div>
            <p style={{fontFamily:F.u,fontSize:13,color:"#2A4A6A",lineHeight:1.7,margin:0}}>{q.ai_response}</p>
          </div>
        )}
        {q.professional_response&&(
          <div style={{background:C.sageSoft,border:`1px solid ${C.sageMid}`,borderRadius:18,padding:"16px",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <div style={{width:26,height:26,borderRadius:8,background:C.sage,display:"flex",alignItems:"center",justifyContent:"center"}}><Check s={12} c="#fff"/></div>
              <div><div style={{fontFamily:F.u,fontSize:11,fontWeight:700,color:C.sage}}>Verified Doctor</div><div style={{fontFamily:F.u,fontSize:10,color:C.inkSoft}}>MDCN-verified</div></div>
            </div>
            <p style={{fontFamily:F.u,fontSize:13,color:C.ink,lineHeight:1.7,margin:0}}>{q.professional_response}</p>
            {q.answered_at&&<div style={{fontFamily:F.u,fontSize:10,color:C.inkSoft,marginTop:8}}>Answered {new Date(q.answered_at).toLocaleDateString("en-NG",{day:"numeric",month:"short"})}</div>}
          </div>
        )}
        {isPending&&(
          <div style={{background:C.warnSoft,border:`1px solid ${C.warn}30`,borderRadius:18,padding:"18px",textAlign:"center",marginBottom:12}}>
            <div style={{fontSize:28,marginBottom:8}}>⏳</div>
            <div style={{fontFamily:F.d,fontSize:17,color:C.ink,fontWeight:600,marginBottom:4}}>Being reviewed</div>
            <p style={{fontFamily:F.u,fontSize:12,color:C.inkMid,lineHeight:1.6,margin:0}}>Our AI is processing your question. A verified doctor will review shortly.</p>
          </div>
        )}
        {messages.length>0&&(
          <div style={{marginTop:8}}>
            <div style={{fontFamily:F.u,fontSize:9,fontWeight:700,color:C.inkSoft,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10,textAlign:"center"}}>— Follow-up conversation —</div>
            {messages.map((msg,i)=>(
              <div key={i} style={{marginBottom:10,display:"flex",flexDirection:"column",alignItems:msg.role==="patient"?"flex-end":"flex-start"}}>
                <div style={{maxWidth:"85%",background:msg.role==="patient"?C.ink:msg.role==="ai"?"#EEF3F8":C.sageSoft,borderRadius:msg.role==="patient"?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"12px 14px",border:msg.role==="patient"?"none":msg.role==="ai"?"1px solid #C8D8E8":`1px solid ${C.sageMid}`}}>
                  {msg.role!=="patient"&&<div style={{fontFamily:F.u,fontSize:9,fontWeight:700,color:msg.role==="ai"?"#4A6B8A":C.sage,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{msg.role==="ai"?"AI":"Doctor"}</div>}
                  <p style={{fontFamily:F.u,fontSize:13,color:msg.role==="patient"?"#fff":msg.role==="ai"?"#2A4A6A":C.ink,lineHeight:1.55,margin:0}}>{msg.content}</p>
                  <div style={{fontFamily:F.u,fontSize:9,color:msg.role==="patient"?"rgba(255,255,255,0.5)":C.inkSoft,marginTop:4,textAlign:msg.role==="patient"?"right":"left"}}>{new Date(msg.created_at).toLocaleTimeString("en-NG",{hour:"2-digit",minute:"2-digit"})}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!isPending&&!isClosed&&timeLeft>0&&(
          <div style={{background:C.sandSoft,border:`1px solid ${C.sandMid}`,borderRadius:12,padding:"10px 14px",marginTop:8,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:14}}>⏱️</span>
            <span style={{fontFamily:F.u,fontSize:11,color:C.inkMid}}>Thread closes in <strong style={{color:C.ink}}>{hoursLeft}h {minsLeft}m</strong></span>
          </div>
        )}
        {isClosed&&(
          <div style={{background:"#F5F5F5",border:"1px solid #E0E0E0",borderRadius:14,padding:"16px",marginTop:8,textAlign:"center"}}>
            <div style={{fontSize:22,marginBottom:8}}>🔒</div>
            <div style={{fontFamily:F.d,fontSize:17,color:C.ink,fontWeight:600,marginBottom:6}}>Thread closed</div>
            <p style={{fontFamily:F.u,fontSize:12,color:C.inkMid,lineHeight:1.5,marginBottom:14}}>This conversation closed after 24 hours.</p>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button onClick={reopenThread} style={{padding:"10px 18px",borderRadius:12,background:C.ink,color:"#fff",fontFamily:F.u,fontSize:12,fontWeight:600,border:"none",cursor:"pointer"}}>Reopen thread</button>
              <button onClick={onNewQuestion} style={{padding:"10px 18px",borderRadius:12,border:`1px solid ${C.border}`,background:"transparent",color:C.inkMid,fontFamily:F.u,fontSize:12,cursor:"pointer"}}>New question</button>
            </div>
          </div>
        )}
        <OkMsg msg={ok}/>
        <div ref={bottomRef}/>
        <div style={{background:C.roseSoft,border:`1px solid ${C.roseMid}`,borderRadius:12,padding:"10px 13px",marginTop:8,display:"flex",gap:8}}>
          <Shield s={12}/><span style={{fontFamily:F.u,fontSize:10,color:C.inkMid,lineHeight:1.5}}>For guidance only — not a substitute for professional medical advice.</span>
        </div>
      </div>
      {!isPending&&!isClosed&&(
        <div style={{padding:"12px 16px",background:C.surface,borderTop:`1px solid ${C.border}`,flexShrink:0}}>
          <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
            <div style={{flex:1,background:C.bg,border:`1.5px solid ${followUp?C.roseMid:C.border}`,borderRadius:16,padding:"10px 14px",transition:"border-color .2s"}}>
              <textarea rows={2} placeholder="Ask a follow-up question…" value={followUp} onChange={e=>setFollowUp(e.target.value.slice(0,300))}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&followUp.trim()){e.preventDefault();sendFollowUp()}}}
                style={{width:"100%",fontFamily:F.u,fontSize:13,color:C.ink,lineHeight:1.5,background:"transparent"}}/>
            </div>
            <button onClick={sendFollowUp} disabled={!followUp.trim()||sending}
              style={{width:42,height:42,borderRadius:13,background:followUp.trim()&&!sending?C.ink:C.border,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",flexShrink:0,border:"none",cursor:"pointer"}}>
              {sending?<div className="spin" style={{width:16,height:16,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff"}}/>
              :<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ════════ HISTORY ════════ */
function History({onNav}) {
  const {user}=useAuth()
  const [tab,setTab]=useState("questions")
  const [qs,setQs]=useState([])
  const [loading,setLoad]=useState(true)
  const [selected,setSelected]=useState(null)
  const tC={Contraception:C.rose,Menstrual:C.rose,"STIs & STDs":C.warn,Pregnancy:C.sage,Fertility:C.sage,Reproductive:C.rose}
  const tB={Contraception:C.roseSoft,Menstrual:C.roseSoft,"STIs & STDs":C.warnSoft,Pregnancy:C.sageSoft,Fertility:C.sageSoft,Reproductive:C.roseSoft}

  useEffect(()=>{
    if(!user||tab!=="questions"){setLoad(false);return}
    setLoad(true)
    supabase.from("questions").select("*").eq("user_id",user.id).order("created_at",{ascending:false})
      .then(({data})=>{setQs(data||[]);setLoad(false)})
  },[tab,user])

  if(selected) return <QuestionDetail question={selected} onBack={()=>setSelected(null)} onNewQuestion={()=>{setSelected(null);onNav("ask")}}/>

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"16px 22px 0",background:C.surface,borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{fontFamily:F.d,fontSize:24,fontWeight:600,color:C.ink,lineHeight:1.1,marginBottom:4}}>History</div>
        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:12}}><Shield s={11}/><span style={{fontFamily:F.u,fontSize:11,color:C.inkSoft}}>Private — visible only to you</span></div>
        <div style={{display:"flex",borderTop:`1px solid ${C.border}`}}>
          {[["questions","Questions"],["appointments","Appointments"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"12px 0",fontFamily:F.u,fontSize:13,fontWeight:tab===id?600:400,color:tab===id?C.ink:C.inkSoft,borderBottom:`2px solid ${tab===id?C.ink:"transparent"}`,background:"none",border:"none",borderBottomStyle:"solid",cursor:"pointer",transition:"all .2s"}}>{lbl}</button>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px 22px"}}>
        {loading?(
          <div style={{display:"flex",flexDirection:"column",gap:10,paddingTop:8}}>
            {[1,2,3].map(i=><div key={i} style={{height:88,borderRadius:18,background:C.border,opacity:.4}}/>)}
          </div>
        ):tab==="questions"?(
          qs.length===0?(
            <div style={{textAlign:"center",padding:"52px 20px"}}>
              <div style={{fontSize:40,marginBottom:14}}>💬</div>
              <div style={{fontFamily:F.d,fontSize:22,color:C.ink,fontWeight:600,marginBottom:8}}>No questions yet</div>
              <div style={{fontFamily:F.u,fontSize:13,color:C.inkMid,marginBottom:22,lineHeight:1.5}}>Ask your first anonymous health question</div>
              <button onClick={()=>onNav("ask")} style={{padding:"13px 26px",borderRadius:14,background:C.ink,color:"#fff",fontFamily:F.u,fontSize:13,fontWeight:600,border:"none",cursor:"pointer"}}>Ask a question →</button>
            </div>
          ):qs.map((item)=>(
            <div key={item.id} onClick={()=>setSelected(item)}
              style={{background:C.surface,border:`1px solid ${item.status==="professional_answered"?C.sageMid:item.status==="ai_answered"?"#C8D8E8":C.border}`,borderRadius:18,padding:"14px 16px",marginBottom:10,cursor:"pointer",transition:"all .2s"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontFamily:F.u,fontSize:10,fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",color:tC[item.topic]||C.rose,background:tB[item.topic]||C.roseSoft,padding:"4px 9px",borderRadius:99}}>{item.topic}</span>
                <span style={{fontFamily:F.u,fontSize:10,fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",color:item.status==="professional_answered"?C.sage:item.status==="ai_answered"?"#6B8CAE":C.warn,background:item.status==="professional_answered"?C.sageSoft:item.status==="ai_answered"?"#EEF3F8":C.warnSoft,padding:"4px 9px",borderRadius:99}}>
                  {item.status==="professional_answered"?"✓ Answered":item.status==="ai_answered"?"AI Replied":"⏳ Pending"}
                </span>
              </div>
              <p style={{fontFamily:F.u,fontSize:13,color:C.ink,lineHeight:1.45,margin:"0 0 6px"}}>{item.content}</p>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontFamily:F.u,fontSize:11,color:C.inkSoft}}>{new Date(item.created_at).toLocaleDateString("en-NG",{day:"numeric",month:"short",year:"numeric"})}</span>
                {(item.ai_response||item.professional_response)&&<span style={{fontFamily:F.u,fontSize:11,color:item.status==="professional_answered"?C.sage:"#6B8CAE",fontWeight:600}}>Tap to read →</span>}
              </div>
            </div>
          ))
        ):(
          <div style={{textAlign:"center",padding:"52px 20px"}}>
            <div style={{fontSize:40,marginBottom:14}}>📅</div>
            <div style={{fontFamily:F.d,fontSize:22,color:C.ink,fontWeight:600,marginBottom:8}}>No appointments yet</div>
            <div style={{fontFamily:F.u,fontSize:13,color:C.inkMid,marginBottom:22}}>Book your first telehealth consultation</div>
            <button onClick={()=>onNav("ask")} style={{padding:"13px 26px",borderRadius:14,background:C.ink,color:"#fff",fontFamily:F.u,fontSize:13,fontWeight:600,border:"none",cursor:"pointer"}}>Book now →</button>
          </div>
        )}
      </div>
      <PatientBottomNav active="history" onNav={onNav}/>
    </div>
  )
}

/* ════════ PATIENT PROFILE ════════ */
function PatientProfile({onNav}) {
  const {user,profile,signOut,updateProfile}=useAuth()
  const [editing,setEditing]=useState(false)
  const [name,setName]=useState(profile?.full_name||"")
  const [saving,setSaving]=useState(false)
  const [ok,setOk]=useState("")

  const save=async()=>{
    setSaving(true)
    await updateProfile({full_name:name})
    setSaving(false);setEditing(false)
    setOk("Profile updated!");setTimeout(()=>setOk(""),3000)
  }

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"20px 22px 16px",background:C.surface,borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:12}}>
          <div style={{width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${C.roseSoft},${C.sageSoft})`,border:`2px solid ${C.roseMid}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F.d,fontSize:22,fontWeight:700,color:C.rose,flexShrink:0}}>
            {profile?.full_name?.[0]?.toUpperCase()||user?.email?.[0]?.toUpperCase()||"?"}
          </div>
          <div style={{flex:1}}>
            {editing?<input value={name} onChange={e=>setName(e.target.value)} style={{fontFamily:F.d,fontSize:20,fontWeight:600,color:C.ink,borderBottom:`1.5px solid ${C.rose}`,width:"100%",paddingBottom:2,background:"transparent"}}/>
            :<div style={{fontFamily:F.d,fontSize:22,fontWeight:600,color:C.ink,lineHeight:1}}>{profile?.full_name||"Anonymous"}</div>}
            <div style={{fontFamily:F.u,fontSize:11,color:C.inkSoft,marginTop:3}}>{user?.email}</div>
          </div>
          {editing?<button onClick={save} style={{padding:"8px 14px",borderRadius:10,background:C.ink,color:"#fff",fontFamily:F.u,fontSize:12,fontWeight:600,border:"none",cursor:"pointer"}}>{saving?"Saving…":"Save"}</button>
          :<button onClick={()=>{setName(profile?.full_name||"");setEditing(true)}} style={{width:34,height:34,borderRadius:10,background:C.bg,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={C.inkSoft} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>}
        </div>
        <OkMsg msg={ok}/>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 22px"}}>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"14px 16px",marginBottom:16}}>
          {[{label:"Email",val:user?.email||"—"},{label:"Member since",val:new Date(user?.created_at||Date.now()).toLocaleDateString("en-NG",{month:"long",year:"numeric"})},{label:"Data storage",val:"NDPR compliant"}].map(row=>(
            <div key={row.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontFamily:F.u,fontSize:12,color:C.inkSoft}}>{row.label}</span>
              <span style={{fontFamily:F.u,fontSize:12,color:C.ink,fontWeight:500}}>{row.val}</span>
            </div>
          ))}
        </div>
        <div style={{background:C.sageSoft,border:`1px solid ${C.sageMid}`,borderRadius:14,padding:"13px 15px",marginBottom:16,display:"flex",gap:10}}>
          <Shield s={15}/><div><div style={{fontFamily:F.u,fontSize:13,fontWeight:600,color:C.sage,marginBottom:2}}>NDPR Compliant</div><div style={{fontFamily:F.u,fontSize:11,color:C.inkMid,lineHeight:1.5}}>Your data is stored securely and never sold.</div></div>
        </div>
        <button onClick={signOut} style={{width:"100%",background:"#FFF0EE",border:"1px solid #F5D0CC",borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
          <div style={{width:32,height:32,borderRadius:9,background:"#FDEBE8",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Logout s={15} c={C.rose}/></div>
          <span style={{fontFamily:F.u,fontSize:13,fontWeight:500,color:C.rose,flex:1,textAlign:"left"}}>Sign out</span>
        </button>
        <p style={{fontFamily:F.u,fontSize:10.5,color:C.inkSoft,textAlign:"center",padding:"16px 0",lineHeight:1.6}}>Luna Care v1.0 · lunarcare.health</p>
      </div>
      <PatientBottomNav active="profile" onNav={onNav}/>
    </div>
  )
}

/* ════════ DOCTOR DASHBOARD ════════ */
function DoctorDashboard({onNav}) {
  const {doctor,signOut,refreshDoctor}=useAuth()
  const [tab,setTab]=useState("questions")
  const [questions,setQuestions]=useState([])
  const [loading,setLoad]=useState(true)
  const [selectedQ,setSelectedQ]=useState(null)
  const [response,setResponse]=useState("")
  const [threadReply,setThreadReply]=useState("")
  const [submitting,setSubmitting]=useState(false)
  const [ok,setOk]=useState("")
  const [isOnline,setIsOnline]=useState(doctor?.is_online||false)
  const tC={Menstrual:C.rose,Pregnancy:C.sage,Contraception:C.sand,"STIs & STDs":C.warn,Reproductive:C.rose,Fertility:C.teal}
  const tB={Menstrual:C.roseSoft,Pregnancy:C.sageSoft,Contraception:C.sandSoft,"STIs & STDs":C.warnSoft,Reproductive:C.roseSoft,Fertility:C.tealSoft}

  useEffect(()=>{ loadQuestions() },[tab])

  useEffect(()=>{
    if(!selectedQ)return
    const ch=supabase.channel(`dr-q-${selectedQ.id}`)
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"questions",filter:`id=eq.${selectedQ.id}`},
        p=>{setSelectedQ(prev=>({...prev,...p.new}));loadQuestions()}
      ).subscribe()
    return()=>supabase.removeChannel(ch)
  },[selectedQ?.id])

  const loadQuestions=async()=>{
    setLoad(true)
    let q=supabase.from("questions").select("*").order("created_at",{ascending:false})
    if(tab==="pending")  q=q.eq("status","pending")
    if(tab==="answered") q=q.eq("assigned_doctor_id",doctor?.id)
    if(tab==="urgent")   q=q.eq("is_urgent",true).eq("status","pending")
    const{data}=await q.limit(50)
    setQuestions(data||[])
    setLoad(false)
  }

  const submitResponse=async()=>{
    if(!response.trim()||!selectedQ)return
    setSubmitting(true)
    await supabase.from("questions").update({professional_response:response.trim(),status:"professional_answered",assigned_doctor_id:doctor?.id,answered_at:new Date().toISOString(),last_activity_at:new Date().toISOString()}).eq("id",selectedQ.id)
    await supabase.from("doctors").update({total_answered:(doctor?.total_answered||0)+1,total_earnings:(doctor?.total_earnings||0)+2000}).eq("id",doctor?.id)
    await refreshDoctor()
    setOk("Response submitted!"); setSelectedQ(null); setResponse("")
    setTimeout(()=>setOk(""),3000); loadQuestions(); setSubmitting(false)
  }

  const submitThreadReply=async()=>{
    if(!threadReply.trim()||!selectedQ)return
    setSubmitting(true)
    const messages=Array.isArray(selectedQ.thread_messages)?selectedQ.thread_messages:[]
    const newMsg={role:"doctor",content:threadReply.trim(),created_at:new Date().toISOString()}
    const updated=[...messages,newMsg]
    await supabase.from("questions").update({thread_messages:updated,last_activity_at:new Date().toISOString(),thread_closed_at:null}).eq("id",selectedQ.id)
    setSelectedQ(prev=>({...prev,thread_messages:updated}))
    setThreadReply(""); setOk("Reply sent!"); setTimeout(()=>setOk(""),3000); setSubmitting(false)
  }

  const toggleOnline=async()=>{
    const v=!isOnline; setIsOnline(v)
    await supabase.from("doctors").update({is_online:v}).eq("id",doctor?.id)
  }

  if(selectedQ) return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <NavBar title="Conversation" onBack={()=>{setSelectedQ(null);setResponse("");setThreadReply("")}}
        right={<span style={{fontFamily:F.u,fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",color:selectedQ.status==="professional_answered"?C.sage:selectedQ.status==="ai_answered"?C.teal:C.warn,background:selectedQ.status==="professional_answered"?C.sageSoft:selectedQ.status==="ai_answered"?C.tealSoft:C.warnSoft,padding:"4px 9px",borderRadius:99}}>
          {selectedQ.status==="professional_answered"?"✓ Answered":selectedQ.status==="ai_answered"?"AI Replied":"⏳ Pending"}
        </span>}/>
      <div style={{flex:1,overflowY:"auto",padding:"14px 20px"}}>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"14px",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9}}>
            <span style={{fontFamily:F.u,fontSize:9,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:tC[selectedQ.topic]||C.rose,background:tB[selectedQ.topic]||C.roseSoft,padding:"3px 9px",borderRadius:99}}>{selectedQ.topic}</span>
            {selectedQ.is_urgent&&<span style={{fontFamily:F.u,fontSize:9,fontWeight:700,color:C.warn,background:C.warnSoft,padding:"3px 9px",borderRadius:99}}>🚨 Urgent</span>}
          </div>
          <div style={{fontFamily:F.u,fontSize:10,fontWeight:600,color:C.inkSoft,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Patient Question</div>
          <p style={{fontFamily:F.u,fontSize:13,color:C.ink,lineHeight:1.6,margin:0}}>{selectedQ.content}</p>
        </div>
        {selectedQ.ai_response&&(
          <div style={{background:C.tealSoft,border:`1px solid ${C.tealMid}`,borderRadius:16,padding:"14px",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
              <div style={{width:24,height:24,borderRadius:7,background:C.teal,display:"flex",alignItems:"center",justifyContent:"center"}}><Spark s={11} c="#fff"/></div>
              <div style={{fontFamily:F.u,fontSize:11,fontWeight:700,color:C.teal}}>AI Provisional Response</div>
            </div>
            <p style={{fontFamily:F.u,fontSize:12,color:C.inkMid,lineHeight:1.6,margin:0}}>{selectedQ.ai_response}</p>
          </div>
        )}
        {Array.isArray(selectedQ.thread_messages)&&selectedQ.thread_messages.length>0&&(
          <div style={{marginBottom:10}}>
            <div style={{fontFamily:F.u,fontSize:9,fontWeight:700,color:C.inkSoft,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8,textAlign:"center"}}>— Follow-up conversation —</div>
            {selectedQ.thread_messages.map((msg,i)=>(
              <div key={i} style={{marginBottom:8,display:"flex",flexDirection:"column",alignItems:msg.role==="patient"?"flex-end":"flex-start"}}>
                <div style={{maxWidth:"85%",background:msg.role==="patient"?C.ink:msg.role==="ai"?C.tealSoft:C.sageSoft,borderRadius:msg.role==="patient"?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"10px 13px",border:msg.role==="patient"?"none":msg.role==="ai"?`1px solid ${C.tealMid}`:`1px solid ${C.sageMid}`}}>
                  {msg.role!=="patient"&&<div style={{fontFamily:F.u,fontSize:9,fontWeight:700,color:msg.role==="ai"?C.teal:C.sage,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{msg.role==="ai"?"AI":"Doctor"}</div>}
                  <p style={{fontFamily:F.u,fontSize:12,color:msg.role==="patient"?"#fff":C.ink,lineHeight:1.55,margin:0}}>{msg.content}</p>
                  <div style={{fontFamily:F.u,fontSize:9,color:msg.role==="patient"?"rgba(255,255,255,0.5)":C.inkSoft,marginTop:4,textAlign:msg.role==="patient"?"right":"left"}}>{new Date(msg.created_at).toLocaleTimeString("en-NG",{hour:"2-digit",minute:"2-digit"})}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {selectedQ.status!=="professional_answered"&&(
          <div style={{marginBottom:10}}>
            <div style={{fontFamily:F.u,fontSize:10,fontWeight:700,color:C.inkSoft,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Your Professional Response</div>
            <div style={{background:C.surface,border:`1.5px solid ${response?C.tealMid:C.border}`,borderRadius:14,padding:"13px",marginBottom:10,transition:"border-color .2s"}}>
              <textarea rows={5} placeholder="Provide your professional response. Patient identity is always anonymous." value={response} onChange={e=>setResponse(e.target.value)} style={{width:"100%",fontFamily:F.u,fontSize:13,color:C.ink,lineHeight:1.7,background:"transparent"}}/>
            </div>
            <Btn label={submitting?"Submitting…":"Submit Response"} onClick={submitResponse} disabled={!response.trim()} loading={submitting} bg={C.teal} color="#fff"/>
          </div>
        )}
        {selectedQ.status==="professional_answered"&&(
          <div style={{background:C.sageSoft,border:`1px solid ${C.sageMid}`,borderRadius:12,padding:"12px",textAlign:"center",marginBottom:10}}>
            <span style={{fontFamily:F.u,fontSize:12,color:C.sage,fontWeight:600}}>✓ You have answered this question</span>
          </div>
        )}
        {(selectedQ.status==="professional_answered"||selectedQ.status==="ai_answered")&&(
          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12,marginTop:4}}>
            <div style={{fontFamily:F.u,fontSize:10,fontWeight:700,color:C.teal,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Reply to follow-up</div>
            <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
              <div style={{flex:1,background:C.surface,border:`1.5px solid ${threadReply?C.tealMid:C.border}`,borderRadius:13,padding:"10px 13px",transition:"border-color .2s"}}>
                <textarea rows={2} placeholder="Reply to patient follow-up…" value={threadReply} onChange={e=>setThreadReply(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&threadReply.trim()){e.preventDefault();submitThreadReply()}}}
                  style={{width:"100%",fontFamily:F.u,fontSize:13,color:C.ink,lineHeight:1.5,background:"transparent"}}/>
              </div>
              <button onClick={submitThreadReply} disabled={!threadReply.trim()||submitting}
                style={{width:42,height:42,borderRadius:12,background:threadReply.trim()&&!submitting?C.teal:C.border,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",flexShrink:0,border:"none",cursor:"pointer"}}>
                {submitting?<div className="spin" style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff"}}/>
                :<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </button>
            </div>
          </div>
        )}
        {ok&&<OkMsg msg={ok}/>}
      </div>
    </div>
  )

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"14px 20px",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:38,height:38,borderRadius:"50%",background:C.tealSoft,border:`1.5px solid ${C.tealMid}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F.d,fontSize:16,fontWeight:700,color:C.teal,flexShrink:0}}>
              {doctor?.full_name?.[0]?.toUpperCase()||"D"}
            </div>
            <div>
              <div style={{fontFamily:F.d,fontSize:18,fontWeight:600,color:C.ink,lineHeight:1}}>{doctor?.full_name?.split(" ").slice(0,2).join(" ")||"Doctor"}</div>
              <div style={{fontFamily:F.u,fontSize:10,color:C.teal}}>{doctor?.specialty||""}</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontFamily:F.u,fontSize:10,color:isOnline?C.sage:C.inkSoft,fontWeight:600}}>{isOnline?"Online":"Offline"}</span>
              <div onClick={toggleOnline} style={{width:38,height:22,borderRadius:99,background:isOnline?C.sage:C.border,position:"relative",transition:"background .2s",cursor:"pointer"}}>
                <div style={{position:"absolute",top:2,left:isOnline?18:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,0.1)"}}/>
              </div>
            </div>
            <button onClick={signOut} style={{width:32,height:32,borderRadius:9,background:C.bg,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
              <Logout s={13} c={C.inkSoft}/>
            </button>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {[{label:"Answered",val:doctor?.total_answered||0,color:C.teal,bg:C.tealSoft},{label:"Earned",val:`₦${((doctor?.total_earnings||0)/1000).toFixed(0)}k`,color:C.sage,bg:C.sageSoft},{label:"Rating",val:`${doctor?.rating||"4.9"}★`,color:C.rose,bg:C.roseSoft}].map(s=>(
            <div key={s.label} style={{flex:1,background:s.bg,borderRadius:12,padding:"8px 10px",textAlign:"center"}}>
              <div style={{fontFamily:F.d,fontSize:20,fontWeight:600,color:s.color,lineHeight:1}}>{s.val}</div>
              <div style={{fontFamily:F.u,fontSize:9,color:C.inkSoft,marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 16px",display:"flex",flexShrink:0,overflowX:"auto"}}>
        {[{id:"questions",label:"All"},{id:"pending",label:"Pending"},{id:"urgent",label:"🚨 Urgent"},{id:"answered",label:"Mine"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:"12px 14px",fontFamily:F.u,fontSize:12,fontWeight:tab===t.id?600:400,color:tab===t.id?C.ink:C.inkSoft,borderBottom:`2px solid ${tab===t.id?C.ink:"transparent"}`,background:"none",border:"none",borderBottomStyle:"solid",whiteSpace:"nowrap",cursor:"pointer",transition:"all .2s"}}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px 16px"}}>
        {ok&&<OkMsg msg={ok}/>}
        {loading?(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[1,2,3].map(i=><div key={i} style={{height:88,borderRadius:16,background:C.border,opacity:.4}}/>)}
          </div>
        ):questions.length===0?(
          <div style={{textAlign:"center",padding:"52px 20px"}}>
            <div style={{fontSize:40,marginBottom:14}}>💬</div>
            <div style={{fontFamily:F.d,fontSize:22,color:C.ink,fontWeight:600,marginBottom:8}}>No questions yet</div>
            <div style={{fontFamily:F.u,fontSize:13,color:C.inkMid}}>Patient questions will appear here</div>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {questions.map(q=>(
              <div key={q.id} onClick={()=>{setSelectedQ(q);setResponse(q.professional_response||"")}}
                style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"14px 16px",cursor:"pointer",transition:"all .2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <span style={{fontFamily:F.u,fontSize:9,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",color:tC[q.topic]||C.rose,background:tB[q.topic]||C.roseSoft,padding:"3px 9px",borderRadius:99}}>{q.topic}</span>
                    {q.is_urgent&&<span style={{fontFamily:F.u,fontSize:9,fontWeight:700,color:C.warn,background:C.warnSoft,padding:"3px 9px",borderRadius:99}}>🚨</span>}
                  </div>
                  <span style={{fontFamily:F.u,fontSize:9,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",color:q.status==="professional_answered"?C.sage:q.status==="ai_answered"?C.teal:C.warn,background:q.status==="professional_answered"?C.sageSoft:q.status==="ai_answered"?C.tealSoft:C.warnSoft,padding:"3px 9px",borderRadius:99,flexShrink:0}}>
                    {q.status==="professional_answered"?"✓ Answered":q.status==="ai_answered"?"AI Replied":"Pending"}
                  </span>
                </div>
                <p style={{fontFamily:F.u,fontSize:13,color:C.ink,lineHeight:1.45,margin:"0 0 6px"}}>{q.content}</p>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontFamily:F.u,fontSize:10,color:C.inkSoft}}>{new Date(q.created_at).toLocaleDateString("en-NG",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</span>
                  {Array.isArray(q.thread_messages)&&q.thread_messages.length>0&&<span style={{fontFamily:F.u,fontSize:10,color:C.teal,fontWeight:600}}>💬 {q.thread_messages.length}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <DoctorBottomNav active="questions" onNav={onNav}/>
    </div>
  )
}

/* ════════ DOCTOR PROFILE ════════ */
function DoctorProfile({onNav}) {
  const {doctor,refreshDoctor,signOut}=useAuth()
  const [editing,setEditing]=useState(false)
  const [form,setForm]=useState({bio:doctor?.bio||"",experience:String(doctor?.years_experience||""),phone:doctor?.phone||""})
  const [saving,setSaving]=useState(false)
  const [ok,setOk]=useState("")
  const set=(k,v)=>setForm(f=>({...f,[k]:v}))

  const save=async()=>{
    setSaving(true)
    await supabase.from("doctors").update({bio:form.bio,years_experience:parseInt(form.experience)||0,phone:form.phone,updated_at:new Date().toISOString()}).eq("id",doctor?.id)
    await refreshDoctor()
    setSaving(false);setEditing(false)
    setOk("Profile updated!");setTimeout(()=>setOk(""),3000)
  }

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"20px 20px 16px",background:C.surface,borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:12}}>
          <div style={{width:56,height:56,borderRadius:"50%",background:C.tealSoft,border:`2px solid ${C.tealMid}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F.d,fontSize:22,fontWeight:700,color:C.teal,flexShrink:0}}>
            {doctor?.full_name?.[0]?.toUpperCase()||"D"}
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:F.d,fontSize:20,fontWeight:600,color:C.ink,lineHeight:1}}>{doctor?.full_name||"Doctor"}</div>
            <div style={{fontFamily:F.u,fontSize:11,color:C.teal,marginTop:2}}>{doctor?.specialty}</div>
          </div>
          {editing?<button onClick={save} style={{padding:"8px 14px",borderRadius:10,background:C.teal,color:"#fff",fontFamily:F.u,fontSize:12,fontWeight:600,border:"none",cursor:"pointer"}}>{saving?"Saving…":"Save"}</button>
          :<button onClick={()=>setEditing(true)} style={{width:34,height:34,borderRadius:10,background:C.bg,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={C.inkSoft} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>}
        </div>
        {ok&&<OkMsg msg={ok}/>}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px 18px"}}>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"16px",marginBottom:14}}>
          <div style={{fontFamily:F.u,fontSize:10,fontWeight:700,color:C.inkSoft,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12}}>Professional Details</div>
          {[{label:"MDCN Number",val:doctor?.mdcn_number},{label:"Specialty",val:doctor?.specialty},{label:"Email",val:doctor?.email},{label:"Status",val:<span style={{fontFamily:F.u,fontSize:10,fontWeight:700,color:doctor?.status==="verified"?C.sage:C.warn,background:doctor?.status==="verified"?C.sageSoft:C.warnSoft,padding:"3px 9px",borderRadius:99,textTransform:"uppercase",letterSpacing:"0.05em"}}>{doctor?.status||"pending"}</span>}].map(row=>(
            <div key={row.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontFamily:F.u,fontSize:12,color:C.inkSoft}}>{row.label}</span>
              <span style={{fontFamily:F.u,fontSize:12,color:C.ink,fontWeight:500}}>{row.val||"—"}</span>
            </div>
          ))}
          {editing&&(
            <div style={{marginTop:12}}>
              {[{label:"Phone",k:"phone",ph:"+234 801 234 5678"},{label:"Years of Experience",k:"experience",ph:"e.g. 8",type:"number"}].map(f=>(
                <div key={f.k} style={{marginBottom:10}}>
                  <div style={{fontFamily:F.u,fontSize:10,fontWeight:600,color:C.inkSoft,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>{f.label}</div>
                  <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px"}}>
                    <input type={f.type||"text"} value={form[f.k]} onChange={e=>set(f.k,e.target.value)} placeholder={f.ph} style={{width:"100%",fontFamily:F.u,fontSize:13,color:C.ink,background:"transparent"}}/>
                  </div>
                </div>
              ))}
              <div style={{fontFamily:F.u,fontSize:10,fontWeight:600,color:C.inkSoft,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Bio</div>
              <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px"}}>
                <textarea rows={3} value={form.bio} onChange={e=>set("bio",e.target.value.slice(0,300))} style={{width:"100%",fontFamily:F.u,fontSize:13,color:C.ink,background:"transparent",resize:"none"}}/>
              </div>
            </div>
          )}
        </div>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"16px",marginBottom:14}}>
          <div style={{fontFamily:F.u,fontSize:10,fontWeight:700,color:C.inkSoft,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12}}>Earnings</div>
          {[{label:"Questions answered",val:doctor?.total_answered||0,color:C.teal},{label:"Total earned",val:`₦${((doctor?.total_earnings||0)).toLocaleString()}`,color:C.sage},{label:"Rating",val:`${doctor?.rating||"4.9"} ★`,color:C.rose}].map(row=>(
            <div key={row.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontFamily:F.u,fontSize:12,color:C.inkSoft}}>{row.label}</span>
              <span style={{fontFamily:F.u,fontSize:14,color:row.color,fontWeight:600}}>{row.val}</span>
            </div>
          ))}
        </div>
        <button onClick={signOut} style={{width:"100%",background:"#FFF0EE",border:"1px solid #F5D0CC",borderRadius:14,padding:"14px",display:"flex",alignItems:"center",justifyContent:"center",gap:10,cursor:"pointer"}}>
          <Logout s={14} c={C.rose}/><span style={{fontFamily:F.u,fontSize:13,fontWeight:500,color:C.rose}}>Sign out</span>
        </button>
      </div>
      <DoctorBottomNav active="profile" onNav={onNav}/>
    </div>
  )
}

/* ════════ DOCTOR PENDING SCREEN ════════ */
function DoctorPendingScreen({onSignOut}) {
  const {doctor}=useAuth()
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px",textAlign:"center"}}>
      <div style={{width:72,height:72,borderRadius:"50%",background:C.tealSoft,border:`1.5px solid ${C.tealMid}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20,fontSize:32}}>⏳</div>
      <div style={{fontFamily:F.d,fontSize:28,fontWeight:600,color:C.ink,marginBottom:10,lineHeight:1.2}}>Application Under Review</div>
      <p style={{fontFamily:F.u,fontSize:14,color:C.inkMid,lineHeight:1.7,marginBottom:28,maxWidth:320}}>Thank you, <strong style={{color:C.ink}}>{doctor?.full_name?.split(" ")[0]||"Doctor"}</strong>! Your application is being reviewed. You'll receive an email at <strong style={{color:C.teal}}>{doctor?.email}</strong> once verified.</p>
      <div style={{background:C.tealSoft,border:`1px solid ${C.tealMid}`,borderRadius:14,padding:"14px 18px",marginBottom:24,display:"flex",gap:10,alignItems:"center",textAlign:"left",width:"100%",maxWidth:340}}>
        <span style={{fontSize:18}}>⏱️</span>
        <span style={{fontFamily:F.u,fontSize:12,color:C.teal,lineHeight:1.5}}>Review takes <strong>24–48 hours</strong>. We'll email you when done.</span>
      </div>
      <button onClick={onSignOut} style={{display:"flex",alignItems:"center",gap:8,fontFamily:F.u,fontSize:13,color:C.inkSoft,background:"none",border:"none",cursor:"pointer"}}>
        <Logout s={14} c={C.inkSoft}/> Sign out
      </button>
    </div>
  )
}

/* ════════ ROUTER ════════ */
function AppInner() {
  const {user,doctor,ready,isDoctor,signOut}=useAuth()
  const [screen,   setScreen]   =useState("welcome")
  const [userData, setUserData] =useState(null)
  const [docNav,   setDocNav]   =useState("questions")
  const awaitingOTP=useRef(false)
  const go=s=>setScreen(s)

  // Patient nav
  const patientNav=id=>{
    const map={home:"home",ask:"ask",history:"history",profile:"patientProfile"}
    go(map[id]||"home")
  }

  // Doctor nav
  const doctorNav=id=>{
    setDocNav(id)
    go(id==="profile"?"doctorProfile":"doctorDashboard")
  }

  useEffect(()=>{
    if(!ready)return
    if(awaitingOTP.current)return
    if(screen==="otp")return
    if(user){
      if(isDoctor){
        if(doctor?.status==="verified") go("doctorDashboard")
        else go("doctorPendingScreen")
      } else {
        go("home")
      }
    } else {
      go("welcome")
    }
  },[user,doctor,ready,isDoctor])

  if(!ready)return <Loader msg="Connecting to your account…"/>

  return <>
    {screen==="welcome"          && <Welcome         onRegister={()=>go("role")} onLogin={()=>go("login")}/>}
    {screen==="role"             && <RoleSelect       onBack={()=>go("welcome")} onPatient={()=>go("register")} onDoctor={()=>go("doctorRegister")}/>}
    {screen==="register"         && <Register         onBack={()=>go("role")} onSent={d=>{setUserData(d);awaitingOTP.current=true;go("otp")}}/>}
    {screen==="doctorRegister"   && <DoctorRegister   onBack={()=>go("role")} onSent={d=>{setUserData(d);awaitingOTP.current=true;go("otp")}}/>}
    {screen==="login"            && <Login            onBack={()=>go("welcome")} onSent={d=>{setUserData(d);awaitingOTP.current=true;go("otp")}}/>}
    {screen==="otp"              && <OTP              userData={userData} onBack={()=>{awaitingOTP.current=false;go(userData?.isDoctor?"doctorRegister":userData?.name?"register":"login")}} onDone={()=>{awaitingOTP.current=false}}/>}
    {screen==="home"             && <PatientHome      onNav={patientNav}/>}
    {screen==="ask"              && <Ask              onBack={()=>go("home")} onSubmit={()=>go("home")}/>}
    {screen==="history"          && <History          onNav={patientNav}/>}
    {screen==="patientProfile"   && <PatientProfile   onNav={patientNav}/>}
    {screen==="doctorDashboard"  && <DoctorDashboard  onNav={doctorNav}/>}
    {screen==="doctorProfile"    && <DoctorProfile    onNav={doctorNav}/>}
    {screen==="doctorPendingScreen" && <DoctorPendingScreen onSignOut={signOut}/>}
  </>
}

export default function App() {
  return (
    <Shell>
      <AuthProvider><AppInner/></AuthProvider>
    </Shell>
  )
}
