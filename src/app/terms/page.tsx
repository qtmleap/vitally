'use client'

import { PageHeader } from '@/components/page-header'
import { ForceLightMode } from '@/components/force-light-mode'

export default function TermsPage() {
  return (
    <div className='mx-auto max-w-3xl px-6 py-8 lg:py-12'>
      <ForceLightMode />
      <PageHeader title='利用規約' back />
      <div className='space-y-6 text-sm leading-relaxed'>
        <p className='text-muted-foreground text-xs'>最終更新日: 2026年4月9日</p>

        <section className='space-y-2'>
          <h2 className='text-base font-semibold'>1. サービスの概要</h2>
          <p>
            Vitally（以下「本サービス」）は、食事・運動の記録および AI によるアドバイス機能を提供する Web
            アプリケーションです。本サービスは health.qleap.jp にて提供されます。
          </p>
        </section>

        <section className='space-y-2'>
          <h2 className='text-base font-semibold'>2. アカウント</h2>
          <p>
            本サービスへのログインには Google アカウントを使用します。ユーザーは自身のアカウント情報の正確性について責任を負います。
            アカウントの不正利用が判明した場合は速やかにご連絡ください。
          </p>
        </section>

        <section className='space-y-2'>
          <h2 className='text-base font-semibold'>3. 利用ルール</h2>
          <p>ユーザーは以下の行為を行ってはなりません。</p>
          <ul className='list-disc space-y-1 pl-5'>
            <li>本サービスへの不正アクセスまたはその試み</li>
            <li>本サービスの運営を妨害する行為</li>
            <li>他のユーザーに迷惑をかける行為</li>
            <li>法令または公序良俗に反する行為</li>
          </ul>
        </section>

        <section className='space-y-2'>
          <h2 className='text-base font-semibold'>4. 免責事項</h2>
          <p>
            本サービスの AI アドバイスは参考情報の提供を目的としており、医療的な診断・助言・治療の代替となるものではありません。
            健康に関する判断は必ず医療専門家にご相談ください。
          </p>
          <p>
            当方は、本サービスのデータ損失、システム障害その他の損害について、法令上の責任を負う場合を除き、責任を負いません。
          </p>
        </section>

        <section className='space-y-2'>
          <h2 className='text-base font-semibold'>5. サービスの変更・終了</h2>
          <p>
            当方は、ユーザーへの事前通知なく、本サービスの内容を変更または提供を終了する場合があります。
            これによりユーザーに生じた損害について、当方は責任を負いません。
          </p>
        </section>

        <section className='space-y-2'>
          <h2 className='text-base font-semibold'>6. 規約の変更</h2>
          <p>
            本規約を変更する場合は、アプリ内にて通知します。変更後も本サービスを利用し続けることで、変更後の規約に同意したものとみなします。
          </p>
        </section>
      </div>
    </div>
  )
}
