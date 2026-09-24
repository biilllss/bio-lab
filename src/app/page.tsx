'use client'

import dynamic from 'next/dynamic'

/**
 * The 3D lab runs entirely client-side (WebGL + WebAudio), so it is loaded
 * with ssr:false. All biology topics are registered in
 * src/lib/lab/topics/registry.ts — add one there and it appears here.
 */
const BiologyLab = dynamic(() => import('@/components/lab/BiologyLab'), {
  ssr: false,
  loading: () => (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#14181f', color: '#9db0c3',
      fontFamily: 'system-ui, sans-serif', fontSize: 14,
    }}>
      Loading lab…
    </div>
  ),
})

export default function Home() {
  return <BiologyLab />
}
