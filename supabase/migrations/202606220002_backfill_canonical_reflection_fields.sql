with signals as (
  select
    id,
    lower(concat_ws(' ', normalized_trigger, trigger, user_input)) as trigger_signal,
    lower(concat_ws(' ', normalized_thought_pattern, thought_pattern, ai_result)) as thought_signal,
    lower(concat_ws(' ', normalized_next_step_type, next_step_type, next_step, ai_result)) as next_step_signal,
    lower(concat_ws(' ', normalized_check_in_signal, follow_up_result, follow_up_note)) as check_in_signal
  from reflections
)
update reflections
set
  ui_language = coalesce(nullif(reflections.ui_language, ''), reflections.language, 'en'),
  reflection_language = coalesce(nullif(reflections.reflection_language, ''), reflections.language, 'en'),
  short_title = coalesce(
    nullif(reflections.short_title, ''),
    nullif(trim(concat_ws(' · ', nullif(reflections.emotion, ''), nullif(reflections.trigger, ''))), ''),
    'Reflection card'
  ),
  mood_chip = coalesce(nullif(reflections.mood_chip, ''), nullif(reflections.emotion, '')),
  normalized_trigger = case
    when reflections.normalized_trigger in (
      'delayed_reply',
      'comparison',
      'silence_after_conflict',
      'uncertainty',
      'feeling_ignored',
      'workload_stress',
      'social_media_checking',
      'fear_of_rejection',
      'other'
    ) then reflections.normalized_trigger
    when signals.trigger_signal like any (array['%delayed%', '%late%', '%reply%', '%message%', '%text%', '%回复%', '%消息%', '%回信%']) then 'delayed_reply'
    when signals.trigger_signal like any (array['%checking%', '%instagram%', '%tiktok%', '%social media%', '%刷%', '%查看%', '%社交媒体%']) then 'social_media_checking'
    when signals.trigger_signal like any (array['%reject%', '%rejection%', '%abandon%', '%被拒绝%', '%拒绝%']) then 'fear_of_rejection'
    when signals.trigger_signal like any (array['%comparison%', '%compare%', '%别人%', '%比较%', '%社交%']) then 'comparison'
    when signals.trigger_signal like any (array['%silence%', '%conflict%', '%argument%', '%冷战%', '%冲突%', '%沉默%']) then 'silence_after_conflict'
    when signals.trigger_signal like any (array['%ignored%', '%unseen%', '%not cared%', '%不被在意%', '%忽视%']) then 'feeling_ignored'
    when signals.trigger_signal like any (array['%work%', '%workload%', '%deadline%', '%shift%', '%job%', '%工作%', '%加班%', '%任务%']) then 'workload_stress'
    when signals.trigger_signal like any (array['%uncertain%', '%unknown%', '%not enough%', '%不确定%', '%不知道%', '%没信息%']) then 'uncertainty'
    else 'other'
  end,
  normalized_thought_pattern = case
    when reflections.normalized_thought_pattern in (
      'mind_reading',
      'catastrophising',
      'comparison_thinking',
      'emotional_reasoning',
      'reassurance_seeking',
      'overgeneralisation',
      'avoidance',
      'self_blame',
      'rejection_sensitivity',
      'other'
    ) then reflections.normalized_thought_pattern
    when signals.thought_signal like any (array['%mind reading%', '%读心%']) then 'mind_reading'
    when signals.thought_signal like any (array['%catastroph%', '%worst%', '%灾难%']) then 'catastrophising'
    when signals.thought_signal like any (array['%comparison%', '%比较%']) then 'comparison_thinking'
    when signals.thought_signal like any (array['%emotional reasoning%', '%情绪化推理%']) then 'emotional_reasoning'
    when signals.thought_signal like any (array['%reassurance%', '%confirm%', '%确认%', '%安慰%']) then 'reassurance_seeking'
    when signals.thought_signal like any (array['%reject%', '%rejection%', '%被拒绝%', '%拒绝%']) then 'rejection_sensitivity'
    when signals.thought_signal like any (array['%avoid%', '%回避%', '%逃避%']) then 'avoidance'
    when signals.thought_signal like any (array['%self-blame%', '%self blame%', '%自责%']) then 'self_blame'
    when signals.thought_signal like any (array['%overgeneral%', '%over-general%', '%概括%']) then 'overgeneralisation'
    else 'other'
  end,
  normalized_next_step_type = case
    when reflections.normalized_next_step_type in (
      'clarify_facts',
      'pause_before_replying',
      'grounding',
      'reassurance_request',
      'journaling',
      'behaviour_reset',
      'check_in_later',
      'rest_and_regulate',
      'other'
    ) then reflections.normalized_next_step_type
    when signals.next_step_signal like any (array['%clarify%', '%fact%', '%澄清%', '%事实%']) then 'clarify_facts'
    when signals.next_step_signal like any (array['%communicate%', '%message%', '%ask%', '%request%', '%沟通%', '%消息%', '%询问%', '%请求%']) then 'reassurance_request'
    when signals.next_step_signal like any (array['%ground%', '%self-soothe%', '%soothe%', '%稳定%', '%安抚%', '%呼吸%']) then 'grounding'
    when signals.next_step_signal like any (array['%journal%', '%write%', '%记录%', '%写下%']) then 'journaling'
    when signals.next_step_signal like any (array['%reset%', '%start%', '%action%', '%启动%', '%行动%']) then 'behaviour_reset'
    when signals.next_step_signal like any (array['%check-in%', '%check in%', '%later%', '%回看%', '%稍后%']) then 'check_in_later'
    when signals.next_step_signal like any (array['%rest%', '%regulate%', '%do nothing%', '%躺%', '%休息%', '%热水%', '%热敷%']) then 'rest_and_regulate'
    when signals.next_step_signal like any (array['%pause%', '%wait%', '%delay%', '%reply%', '%暂停%', '%等待%', '%延迟%', '%回复%']) then 'pause_before_replying'
    else 'other'
  end,
  normalized_check_in_signal = case
    when reflections.normalized_check_in_signal in (
      'not_checked_in',
      'felt_lighter_later',
      'still_recurring',
      'mostly_resolved',
      'uncertain'
    ) then reflections.normalized_check_in_signal
    when nullif(reflections.follow_up_result, '') is null and nullif(reflections.follow_up_note, '') is null then 'not_checked_in'
    when signals.check_in_signal like any (array['%helped%', '%有帮助%']) then 'felt_lighter_later'
    when signals.check_in_signal like any (array['%somewhat%', '%有一点%']) then 'mostly_resolved'
    when signals.check_in_signal like any (array['%not%', '%did not%', '%没有%', '%无效%']) then 'still_recurring'
    else 'uncertain'
  end
from signals
where reflections.id = signals.id;
