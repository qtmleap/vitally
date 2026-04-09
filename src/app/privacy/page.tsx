'use client'

import { PageHeader } from '@/components/page-header'

export default function PrivacyPage() {
  return (
    <div className='px-4 py-6'>
      <PageHeader title='プライバシーポリシー' back />
      <div className='space-y-6 text-sm leading-relaxed'>
        <p className='text-muted-foreground text-xs'>最終更新日: 2026年4月9日</p>

        <section className='space-y-2'>
          <h2 className='text-base font-semibold'>1. 収集する情報</h2>
          <p>本サービスは以下の情報を収集します。</p>
          <ul className='list-disc space-y-1 pl-5'>
            <li>Google アカウント情報（名前、メールアドレス、プロフィール写真）</li>
            <li>食事・運動の記録データ</li>
            <li>AI アドバイスの利用履歴</li>
          </ul>
        </section>

        <section className='space-y-2'>
          <h2 className='text-base font-semibold'>2. 情報の利用目的</h2>
          <p>収集した情報は以下の目的で利用します。</p>
          <ul className='list-disc space-y-1 pl-5'>
            <li>本サービスの提供および運営</li>
            <li>AI アドバイスの生成</li>
            <li>本サービスの改善および新機能の開発</li>
          </ul>
        </section>

        <section className='space-y-2'>
          <h2 className='text-base font-semibold'>3. 情報の保管</h2>
          <p>
            収集した情報は Cloudflare のインフラ上に保管されます。適切なセキュリティ対策を講じてデータを保護しますが、
            完全な安全性を保証するものではありません。
          </p>
        </section>

        <section className='space-y-2'>
          <h2 className='text-base font-semibold'>4. 第三者提供</h2>
          <p>
            法令に基づく場合を除き、ユーザーの個人情報を第三者に提供することはありません。
            なお、AI アドバイス機能は Cloudflare Workers AI を使用して処理されます。
          </p>
        </section>

        <section className='space-y-2'>
          <h2 className='text-base font-semibold'>5. データの削除</h2>
          <p>
            ユーザーはいつでもアカウントの削除を依頼できます。アカウントを削除した場合、
            本サービスに保存されているすべての関連データは削除されます。
            削除の依頼はアプリ内の設定ページからお問い合わせください。
          </p>
        </section>

        <section className='space-y-2'>
          <h2 className='text-base font-semibold'>6. Cookie</h2>
          <p>本サービスでは、認証目的のみに Cookie を使用します。サービスの提供に必要な範囲でのみ利用します。</p>
        </section>

        <section className='space-y-2'>
          <h2 className='text-base font-semibold'>7. お問い合わせ</h2>
          <p>プライバシーポリシーに関するお問い合わせは、サービス内の設定ページからお問い合わせください。</p>
        </section>
      </div>
    </div>
  )
}
