import type { Project } from '../types';
import { createDimension, createItem, createProject, createVariable } from '../lib/factory';

const LIKERT5 = '1 = Strongly disagree … 5 = Strongly agree';

/**
 * Example project used to demonstrate VariableMap. Items are illustrative and
 * written for this demo; they are not taken from a published instrument.
 */
export function buildExampleProject(): Project {
  const learning = createDimension({ name: 'Learning anxiety', description: 'Worry about learning to use AI tools for study.' });
  const job = createDimension({ name: 'Job replacement anxiety', description: 'Worry that AI will reduce future career opportunities.' });
  const integrity = createDimension({ name: 'Academic integrity concerns', description: 'Worry about acceptable and unacceptable AI use in coursework.' });

  const aiAnxiety = createVariable({
    name: 'AI Anxiety',
    datasetName: 'AIANX_TOTAL',
    role: 'independent',
    construct: 'Technology-related anxiety',
    conceptualDefinition:
      'A feeling of fear, worry, or unease that students experience when thinking about or interacting with artificial intelligence technologies.',
    operationalDefinition:
      'The mean score across nine self-report items rated on a 5-point agreement scale; higher scores indicate higher AI anxiety.',
    dimensions: [learning, job, integrity],
    measurementInstrument: 'Self-report questionnaire (illustrative items for this example)',
    instrumentSource: 'Example only — replace with the instrument you use and its citation.',
    measurementScale: 'likert',
    dataType: 'numeric',
    responseFormat: '5-point Likert agreement scale',
    scoringMethod: 'Mean of items 1–9 after any reverse coding; subscale means per dimension.',
    plannedAnalysis: 'Descriptive statistics; Pearson or Spearman correlation with Academic Anxiety.',
    codingNotes: 'Compute subscale scores only when at least 2 of 3 items are answered.',
    missingDataCode: '-99 = No response',
    sourceCitation: '',
    notes: 'Example project — edit or delete freely.',
    items: [
      createItem({ code: 'AIANX1', text: 'I feel nervous when I have to learn how to use a new AI tool.', dimensionId: learning.id, responseScale: LIKERT5, reverseCoded: 'no' }),
      createItem({ code: 'AIANX2', text: 'Learning to use AI for my studies makes me uneasy.', dimensionId: learning.id, responseScale: LIKERT5, reverseCoded: 'no' }),
      createItem({ code: 'AIANX3', text: 'I feel confident learning new AI applications.', dimensionId: learning.id, responseScale: LIKERT5, reverseCoded: 'yes', codingNotes: 'Positively worded item.' }),
      createItem({ code: 'AIANX4', text: 'I worry that AI will reduce jobs in my field of study.', dimensionId: job.id, responseScale: LIKERT5, reverseCoded: 'no' }),
      createItem({ code: 'AIANX5', text: 'I am concerned that AI could make my degree less valuable.', dimensionId: job.id, responseScale: LIKERT5, reverseCoded: 'no' }),
      createItem({ code: 'AIANX6', text: 'Thinking about AI and my future career makes me anxious.', dimensionId: job.id, responseScale: LIKERT5, reverseCoded: 'no' }),
      createItem({ code: 'AIANX7', text: 'I am unsure whether my use of AI in assignments is allowed.', dimensionId: integrity.id, responseScale: LIKERT5, reverseCoded: 'no' }),
      createItem({ code: 'AIANX8', text: 'I worry about being accused of misusing AI in coursework.', dimensionId: integrity.id, responseScale: LIKERT5, reverseCoded: 'no' }),
      createItem({ code: 'AIANX9', text: 'Rules about AI use at my university make me feel stressed.', dimensionId: integrity.id, responseScale: LIKERT5, reverseCoded: 'not_specified' }),
    ],
  });

  const test = createDimension({ name: 'Test anxiety', description: 'Worry and tension related to exams and assessments.' });
  const workload = createDimension({ name: 'Workload pressure', description: 'Stress related to the amount and pace of coursework.' });

  const academicAnxiety = createVariable({
    name: 'Academic Anxiety',
    datasetName: 'ACANX_TOTAL',
    role: 'dependent',
    construct: 'Academic anxiety',
    conceptualDefinition:
      'Feelings of worry, tension, and apprehension that students experience in relation to academic demands such as exams and coursework.',
    operationalDefinition:
      'The mean score across six self-report items rated on a 5-point agreement scale; higher scores indicate higher academic anxiety.',
    dimensions: [test, workload],
    measurementInstrument: 'Self-report questionnaire (illustrative items for this example)',
    instrumentSource: '',
    measurementScale: 'likert',
    dataType: 'numeric',
    responseFormat: '5-point Likert agreement scale',
    scoringMethod: 'Mean of items 1–6.',
    plannedAnalysis: 'Descriptive statistics; correlation with AI Anxiety.',
    codingNotes: '',
    missingDataCode: '-99 = No response',
    items: [
      createItem({ code: 'ACANX1', text: 'I feel very tense before exams.', dimensionId: test.id, responseScale: LIKERT5, reverseCoded: 'no' }),
      createItem({ code: 'ACANX2', text: 'During tests I worry that I will fail.', dimensionId: test.id, responseScale: LIKERT5, reverseCoded: 'no' }),
      createItem({ code: 'ACANX3', text: 'I stay calm when preparing for assessments.', dimensionId: test.id, responseScale: LIKERT5, reverseCoded: 'yes' }),
      createItem({ code: 'ACANX4', text: 'The amount of coursework I have makes me anxious.', dimensionId: workload.id, responseScale: LIKERT5, reverseCoded: 'no' }),
      createItem({ code: 'ACANX5', text: 'I worry about not meeting assignment deadlines.', dimensionId: workload.id, responseScale: LIKERT5, reverseCoded: 'no' }),
      createItem({ code: 'ACANX6', text: 'I feel overwhelmed by my academic responsibilities.', dimensionId: workload.id, responseScale: '', reverseCoded: 'no' }),
    ],
  });

  return createProject({
    title: 'AI Anxiety Among Undergraduate University Students',
    researchQuestion:
      'What is the relationship between AI anxiety and academic anxiety among undergraduate university students?',
    approach: 'quantitative',
    design: 'Cross-sectional survey',
    description:
      'Example project showing how VariableMap documents variables, dimensions, items, coding, and planned analysis. Some fields are intentionally left incomplete so the review checklist has something to show.',
    variables: [aiAnxiety, academicAnxiety],
    isExample: true,
  });
}
