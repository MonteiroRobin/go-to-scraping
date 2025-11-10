"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FAQ_ITEMS } from "@/lib/pricing-data"
import { HelpCircle } from "lucide-react"

export function PricingFAQ() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Questions fréquentes</h2>
          <p className="text-lg text-muted-foreground">
            Tout ce que vous devez savoir sur nos plans et notre service
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-foreground font-semibold">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center p-6 rounded-xl bg-secondary/50 border border-border">
          <p className="text-foreground font-medium mb-2">Vous avez d'autres questions ?</p>
          <p className="text-sm text-muted-foreground mb-4">
            Notre équipe est là pour vous aider. Contactez-nous par email ou chat.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:contact@gotoscraping.com"
              className="inline-flex items-center justify-center px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Envoyer un email
            </a>
            <a
              href="/faq"
              className="inline-flex items-center justify-center px-6 py-2 rounded-lg border border-border bg-background text-foreground font-medium hover:bg-secondary transition-colors"
            >
              Voir toute la FAQ
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
