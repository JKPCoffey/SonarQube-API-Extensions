package org.sonar.ux.checks.file;

import java.io.File;

import org.junit.Test;
import org.sonar.javascript.checks.verifier.JavaScriptCheckVerifier;
import org.sonar.squidbridge.checks.CheckMessagesVerifier;
import org.sonar.ux.checks.CheckTester;
import org.sonar.ux.checks.factory.UXCheckFactory;
import org.sonar.ux.checks.file.BlankFileCheck;

import data.checks.Check;

public class BlankFileCheckTest 
{
	private Check check = UXCheckFactory.getInstance(BlankFileCheck.class);
	
	private CheckTester blankTester = 
	(filename, hasIssue) ->
	{
		File file = new File(filename);
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(check, file);
		
		if(hasIssue)
		{
			verifier.next()
			.withMessage(check.getCheckMessages()[0])
			.noMore();
		}
		
		else
		{
			verifier.noMore();
		}
	};
	
	
	private static final String RESOURCE_PATH = "./src/test/resources/";
	
	@Test
	public void TableTest() 
	{
		String filename 	= RESOURCE_PATH + "table-examples/pinned-column-table/src/pinned-column-table/widgets/user-table/UserTable.js";
		boolean hasIssue 	= false;
		
		blankTester.test(filename, hasIssue);
	}
	
	@Test
	public void EmptyFileCheck()
	{
		String filename 	= RESOURCE_PATH + "checks/blankFileChecks/emptyFile.js";
		boolean hasIssue 	= true;
		
		blankTester.test(filename, hasIssue);
	}
	
	@Test
	public void CommentOnlyFile()
	{
		String filename = RESOURCE_PATH + "checks/blankFileChecks/commentFile.js";
		boolean hasIssue = true;
		
		blankTester.test(filename, hasIssue);
	}

	@Test
	public void bulkConfigTest()
	{
		String filename = RESOURCE_PATH + "bulk-config/regions/createjoberror/CreateJobError.js";
		boolean hasIssue = false;
		
		blankTester.test(filename, hasIssue);
	}
}
