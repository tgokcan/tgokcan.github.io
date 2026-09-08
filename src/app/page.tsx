import {
  Heading,
  Text,
  Button,
  Avatar,
  RevealFx,
  Column,
  Badge,
  Row,
  Schema,
  Meta,
  Line,
} from "@once-ui-system/core";
import { home, about, person, baseURL, routes, getLocalizedContent } from "@/resources";
import { Mailchimp } from "@/components";
import { Projects } from "@/components/work/Projects";
import { Posts } from "@/components/blog/Posts";
import Post from "@/components/blog/Post";

export async function generateMetadata({ params }: { params?: Promise<{ lang?: "tr" | "en" }> } = {}) {
  const { lang = "en" } = (await params) || {};
  const { home: localizedHome } = getLocalizedContent(lang);
  return Meta.generate({
    title: localizedHome.title,
    description: localizedHome.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

export default async function Home({ params }: { params?: Promise<{ lang?: "tr" | "en" }> }) {
  const { lang = "en" } = (await params) || {};
  const { home: localizedHome } = getLocalizedContent(lang);
  return (
    <Column maxWidth="m" gap="xl" paddingY="12" horizontal="center">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={home.path}
        title={localizedHome.title}
        description={localizedHome.description}
        image={`/api/og/generate?title=${encodeURIComponent(home.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <Column fillWidth horizontal="center" gap="m">
        <Column maxWidth="s" horizontal="center" align="center">
          {localizedHome.featured.display && (
            <RevealFx
              fillWidth
              horizontal="center"
              paddingTop="16"
              paddingBottom="32"
              paddingLeft="12"
            >
              <Badge
              
                background="brand-alpha-weak"
                paddingX="12"
                paddingY="4"
                onBackground="neutral-strong"
                textVariant="label-default-s"
                arrow={false}
                href={home.featured.href}
              >
                
                <Row paddingY="2">{localizedHome.featured.title}</Row>
              </Badge>
            </RevealFx>
          )}
          <RevealFx translateY="4" fillWidth horizontal="center" paddingBottom="16">
            <Heading wrap="balance" variant="display-strong-l">
              {localizedHome.headline}
            </Heading>
          </RevealFx>
          <RevealFx translateY="8" delay={0.2} fillWidth horizontal="center" paddingBottom="32">
            <Text wrap="balance" onBackground="neutral-weak" variant="heading-default-xl">
              {localizedHome.subline}
            
            </Text>
          </RevealFx>
          <RevealFx paddingTop="12" delay={0.4} horizontal="center" paddingLeft="12">
            <Button
              id="about"
              data-border="rounded"
              href={about.path}
              variant="secondary"
              size="m"
              weight="default"
              arrowIcon
            >
              <Row gap="8" vertical="center" paddingRight="4">
                {about.avatar.display && (
                  <Avatar
                    marginRight="8"
                    style={{ marginLeft: "-0.75rem" }}
                    src={person.avatar}
                    size="m"
                  />
                )}
                About - {person.name}
              </Row>
            </Button>
          </RevealFx>
        </Column>
      </Column>
      <RevealFx translateY="16" delay={0.6} fillWidth horizontal="center" paddingTop="32">
      <Text as="h2" id="recent-posts" variant="heading-strong-xl" marginBottom="24">
        {lang === "tr" ? "Son yazılar" : "Recent posts"}
      </Text>
      </RevealFx>
      <RevealFx translateY="16" delay={0.8} fillWidth horizontal="center" paddingTop="32">
        <Posts range={[1, 6]} lang={lang} />
      </RevealFx>
      
    </Column>
  );
}
