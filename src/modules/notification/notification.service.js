import { SendRawEmailCommand, SESClient } from '@aws-sdk/client-ses'
import Handlebars from 'handlebars'
import MailComposer from 'nodemailer/lib/mail-composer'

// Helpers
import { authTemplateHelper } from 'src/modules/helpers'

Handlebars.registerHelper('current_year', () => new Date().getFullYear())

const sendEmailBySES = async (params) => {
  try {
    const composer = new MailComposer({
      from: params?.from_email || process.env.FROM_EMAIL,
      to: params?.to_email,
      replyTo: params?.reply_to,
      subject: params?.subject,
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8" /></head><body>${params?.html}</body></html>`
    })

    const rawContent = await composer?.compile?.().build?.()
    if (!rawContent?.length) {
      throw new Error('COULD_NOT_PREPARE_EMAIL_CONTENT')
    }

    console.log('RAW CONTENT', rawContent.toString())
    return rawContent
    /* eslint-disable-next-line no-unreachable */
    const sesClient = new SESClient({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
      },
      region: process.env.AWS_REGION
    })
    const command = new SendRawEmailCommand({ RawMessage: { Data: rawContent } })
    const response = await sesClient.send(command)

    return response
  } catch (err) {
    throw new Error(err?.message?.toUpperCase?.())
  }
}

export const sendNotification = async (params = {}) => {
  const { event, from_email, to_email, variables = {} } = params || {}
  if (!(event && to_email)) {
    throw new Error('MISSING_REQUIRED_FIELDS_TO_SEND_NOTIFICATION')
  }

  const template = await authTemplateHelper.getAnAuthTemplate({ where: { event } })
  if (!template?.id) {
    throw new Error('AUTH_TEMPLATE_IS_NOT_FOUND')
  }
  if (!template?.body || !template?.subject) {
    throw new Error('MISSING_AUTH_TEMPLATE_BODY_OR_SUBJECT')
  }

  const body = Handlebars.compile(template?.body)
  const subject = Handlebars.compile(template?.subject)

  return sendEmailBySES({
    from_email,
    html: body(variables),
    to_email,
    subject: subject(variables)
  })
}
