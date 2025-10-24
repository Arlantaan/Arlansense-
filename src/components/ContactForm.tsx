import React, { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface ContactFormData {
  name: string
  email: string
  message: string
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Here you would integrate with your preferred email service
      // For now, we'll simulate the submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate successful submission
      toast.success('Message sent successfully! We\'ll get back to you soon.')
      
      // Reset form
      setFormData({ name: '', email: '', message: '' })
    } catch (error) {
      console.error('Error submitting contact form:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="contactName" className="block text-sm font-medium mb-2">
          Your Name
        </label>
        <input
          type="text"
          id="contactName"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sensation-gold focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-gray-300"
          placeholder="Enter full name"
          required
        />
      </div>
      
      <div>
        <label htmlFor="contactEmail" className="block text-sm font-medium mb-2">
          Your Email
        </label>
        <input
          type="email"
          id="contactEmail"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sensation-gold focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-gray-300"
          placeholder="example@gmail.com"
          required
        />
      </div>
      
      <div>
        <label htmlFor="contactMessage" className="block text-sm font-medium mb-2">
          Message
        </label>
        <textarea
          id="contactMessage"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sensation-gold focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 resize-none"
          placeholder="How can we help?"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full btn btn-outline-light py-3 px-6 rounded-lg border-2 border-white text-white hover:bg-white hover:text-sensation-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Sending...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>Send Message</span>
          </>
        )}
      </button>
    </form>
  )
}

export default ContactForm
