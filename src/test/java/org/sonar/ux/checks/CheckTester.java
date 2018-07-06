package org.sonar.ux.checks;

public interface CheckTester 
{
	public void test(String filename, boolean hasIssue);
}
