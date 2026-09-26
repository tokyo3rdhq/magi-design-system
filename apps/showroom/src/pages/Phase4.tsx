import { useState } from 'react';
import {
  Checkbox,
  FormField,
  Input,
  Segmented,
  Banner,
  EmptyState,
  Stack,
  Badge,
  Button,
} from '@tokyo3rdhq/magi-design-system';
import { PageHeader } from './index';
import styles from './pages.module.css';

export function Phase4() {
  const [segmentedValue, setSegmentedValue] = useState('3');
  const [accentValue, setAccentValue] = useState('free');
  const [accept, setAccept] = useState(true);
  const [providers, setProviders] = useState<string[]>(['nvidia']);
  const [showSaved, setShowSaved] = useState(false);

  const toggleProvider = (value: string, checked: boolean) => {
    setProviders((prev) =>
      checked ? [...prev, value] : prev.filter((v) => v !== value),
    );
  };

  return (
    <article>
      <PageHeader
        eyebrow="Phase 4"
        title="Form primitives"
        description="Six primitives extracted from token-factory-initializr's production usage. Released in @tokyo3rdhq/magi-design-system@0.2.0."
      />

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Checkbox
        </h3>
        <p className="magi-body-sm" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Restyled native checkbox. Works standalone or with an inline label.
        </p>
        <Stack gap="4">
          <Checkbox defaultChecked>Default checked</Checkbox>
          <Checkbox>Unchecked</Checkbox>
          <Checkbox disabled>Disabled</Checkbox>
          <Checkbox
            checked={accept}
            onChange={(e) => setAccept(e.target.checked)}
          >
            Accept terms and conditions
          </Checkbox>
        </Stack>
      </section>

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Input
        </h3>
        <p className="magi-body-sm" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Three sizes. <code className="magi-code">invalid</code> adds error styling.
        </p>
        <Stack gap="4">
          <Input placeholder="Small input" inputSize="sm" />
          <Input placeholder="Medium input (default)" />
          <Input placeholder="Large input" inputSize="lg" />
          <Input placeholder="Invalid input" invalid defaultValue="bad" />
          <Input type="password" placeholder="Password" />
        </Stack>
      </section>

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          FormField
        </h3>
        <p className="magi-body-sm" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Label + control + optional helper or error.
        </p>
        <Stack gap="6">
          <FormField label="Project" helper="What you're building.">
            <Input placeholder="e.g. Coding assistant" />
          </FormField>
          <FormField label="Email" error="Must be a valid email address.">
            <Input type="email" defaultValue="not-an-email" />
          </FormField>
        </Stack>
      </section>

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Segmented (single-select only)
        </h3>
        <p className="magi-body-sm" style={{ marginBottom: 'var(--magi-space-4)' }}>
          For multi-select, use a Checkbox group — see below.
        </p>
        <Stack gap="6">
          <FormField label="Max models" helper="How many models to include (1–10).">
            <Segmented
              value={segmentedValue}
              options={[
                { value: '1', label: '1' },
                { value: '3', label: '3' },
                { value: '5', label: '5' },
                { value: '10', label: '10' },
              ]}
              onChange={setSegmentedValue}
            />
          </FormField>
          <FormField label="Cost" helper="Free only = zero-cost endpoints.">
            <Segmented
              value={accentValue}
              options={[
                { value: 'free', label: 'Free only' },
                { value: 'any', label: 'Any' },
              ]}
              onChange={setAccentValue}
              accent
            />
          </FormField>
        </Stack>
      </section>

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Checkbox group (use this for multi-select — not Segmented)
        </h3>
        <FormField label="Providers" helper="Pick which providers to include.">
          <Stack direction="row" gap="4">
            <Checkbox
              checked={providers.includes('nvidia')}
              onChange={(e) => toggleProvider('nvidia', e.target.checked)}
            >
              NVIDIA
            </Checkbox>
            <Checkbox
              checked={providers.includes('amd')}
              onChange={(e) => toggleProvider('amd', e.target.checked)}
            >
              AMD
            </Checkbox>
            <Checkbox
              checked={providers.includes('huggingface')}
              onChange={(e) => toggleProvider('huggingface', e.target.checked)}
            >
              Hugging Face
            </Checkbox>
          </Stack>
        </FormField>
        <p className="magi-caption" style={{ marginTop: 'var(--magi-space-3)' }}>
          Selected: {providers.join(', ') || 'none'}
        </p>
      </section>

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Banner — four variants
        </h3>
        <Stack gap="3">
          <Banner variant="info">
            No requirements set yet. Go back to specify what you're building.
          </Banner>
          <Banner variant="warning">
            This action will reset all your saved configurations.
          </Banner>
          <Banner variant="error">
            Could not load KV catalog: network timeout.
          </Banner>
          <Banner variant="success">
            Saved successfully. <a href="#">View changes</a>.
          </Banner>
        </Stack>
      </section>

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          EmptyState
        </h3>
        <Stack gap="6">
          <EmptyState>
            No models match. Try loosening the constraints —{' '}
            <a href="#">edit requirements</a>.
          </EmptyState>
          <EmptyState
            title="Nothing selected"
            description="Pick models on the Browse page first."
            action={
              <Button variant="primary" onClick={() => setShowSaved(true)}>
                Go to Browse
              </Button>
            }
          />
        </Stack>
        {showSaved && (
          <div style={{ marginTop: 'var(--magi-space-4)' }}>
            <Badge variant="success" dot>
              Navigated (demo)
            </Badge>
          </div>
        )}
      </section>
    </article>
  );
}