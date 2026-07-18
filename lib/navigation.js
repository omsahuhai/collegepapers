export function getBreadcrumbSteps({
  university,
  uniRecord,
  collegeRecord,
  courseRecord,
  selectedSemester,
  selectedSubject,
}) {
  const steps = [
    { label: 'Home', href: '/' },
    { label: uniRecord.code.toUpperCase(), href: `/institutes/${university}` },
  ];

  if (collegeRecord) {
    steps.push({
      label: collegeRecord.code.toUpperCase(),
      href: `/institutes/${university}/c/${collegeRecord.code}`,
    });
  }

  if (courseRecord) {
    const courseUrl = collegeRecord
      ? `/institutes/${university}/c/${collegeRecord.code}/${courseRecord.code}`
      : `/institutes/${university}/u/${courseRecord.code}`;
    steps.push({
      label: courseRecord.code.toUpperCase(),
      href: courseUrl,
    });
  }

  if (selectedSemester) {
    const semSlug = encodeURIComponent(selectedSemester.replace(/\s+/g, '-'));
    const semUrl = collegeRecord
      ? `/institutes/${university}/c/${collegeRecord.code}/${courseRecord.code}/${semSlug}`
      : `/institutes/${university}/u/${courseRecord.code}/${semSlug}`;
    steps.push({
      label: selectedSemester,
      href: semUrl,
    });
  }

  if (selectedSubject) {
    steps.push({
      label: selectedSubject,
      // The last step typically doesn't need an href, or it just acts as current page
    });
  }

  // Remove the href from the very last step to match previous behavior where current step is not a link
  if (steps.length > 0) {
    delete steps[steps.length - 1].href;
  }

  return steps;
}

export function getBackUrl({
  university,
  collegeRecord,
  courseRecord,
  selectedSemester,
  selectedSubject,
}) {
  // If we are at the subject level (showing papers), back goes to semester
  if (selectedSubject) {
    const semSlug = encodeURIComponent(selectedSemester.replace(/\s+/g, '-'));
    return collegeRecord
      ? `/institutes/${university}/c/${collegeRecord.code}/${courseRecord.code}/${semSlug}`
      : `/institutes/${university}/u/${courseRecord.code}/${semSlug}`;
  }

  // If we are at the semester level, back goes to course
  if (selectedSemester) {
    return collegeRecord
      ? `/institutes/${university}/c/${collegeRecord.code}/${courseRecord.code}`
      : `/institutes/${university}/u/${courseRecord.code}`;
  }
  
  // If we are at the course level, back goes to college (if college exists) or university
  if (courseRecord) {
    if (collegeRecord) {
      return `/institutes/${university}/c/${collegeRecord.code}`;
    }
    return `/institutes/${university}`;
  }
  
  // If we are at the college level, back goes to university
  if (collegeRecord) {
    return `/institutes/${university}`;
  }
  
  // If we are at university level, back goes to root
  return '/';
}
