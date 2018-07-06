package org.sonar.ux.checks.table.settings;

import java.io.File;
import java.io.IOException;
import java.io.Writer;
import java.util.ArrayList;

import org.junit.BeforeClass;
import org.junit.Test;

import org.sonar.ux.checks.factory.UXCheckFactory;

import org.sonar.ux.checks.table.settings.ApplyCancelFlyoutCheck;
import org.sonar.ux.checks.table.settings.TableSettingsCheck;

import data.checks.Check;
import data.logging.TestLogger;
import utilities.ExamplesFileFilter;

import org.sonar.javascript.checks.verifier.JavaScriptCheckVerifier;

import org.sonar.squidbridge.checks.CheckMessagesVerifier;

public class ApplyCancelFlyoutCheckTest
{
	private static final String  RESOURCE_PATH = "src/test/resources/";
	
	private Check acfCheck = UXCheckFactory.getInstance(ApplyCancelFlyoutCheck.class);
	private Check setCheck = UXCheckFactory.getInstance(TableSettingsCheck.class);
	private static TestLogger logger;
	
	@BeforeClass
	public static void init()
	{
		logger = new TestLogger(ApplyCancelFlyoutCheckTest.class);
	}
	
	@Test
	public void validTest() 
	{
		File file = new File(RESOURCE_PATH + "table-examples/simple-table-settings/src/simple-table-settings/widgets/user-table/UserTable.js");
		JavaScriptCheckVerifier.issues(acfCheck, file)
		.noMore();
	}
	
	@Test
	public void noApplyNoCancelTest()
	{
		File file = new File(RESOURCE_PATH + "checks/table/settings/applyCancelFlyoutChecks/no-apply-no-cancel-table/widgets/user-table/UserTableSettings.js");
		JavaScriptCheckVerifier.issues(acfCheck, file)
		.next()
		.withMessage(acfCheck.getCheckMessages()[0])
		.next()
		.withMessage(acfCheck.getCheckMessages()[1])
		.noMore();
	}
	
	@Test
	public void noApplyTest()
	{
		File file = new File(RESOURCE_PATH + "checks/table/settings/applyCancelFlyoutChecks/no-apply-table/widgets/user-table/UserTableSettings.js");
		JavaScriptCheckVerifier.issues(acfCheck, file)
		.next()
		.withMessage(acfCheck.getCheckMessages()[0])
		.noMore();
	}
	
	@Test
	public void noCancelTest()
	{
		File file = new File(RESOURCE_PATH + "checks/table/settings/applyCancelFlyoutChecks/no-cancel-table/widgets/user-table/UserTableSettings.js");
		JavaScriptCheckVerifier.issues(setCheck, file)
		.noMore();
		
		JavaScriptCheckVerifier.issues(acfCheck, file)
		.next()
		.withMessage(acfCheck.getCheckMessages()[1])
		.noMore();
	}
	
	@Test
	public void applyAndCancelTest()
	{
		File file = new File(RESOURCE_PATH + "checks/table/settings/applyCancelFlyoutChecks/apply-and-cancel-table/widgets/user-table/UserTable.js");
		JavaScriptCheckVerifier.issues(acfCheck, file)
		.noMore();
	}
	
	@Test
	public void allExamplesTest() throws IOException
	{
		File examplesFolder = new File(RESOURCE_PATH + "table-examples/");
		
		File [] examples = examplesFolder.listFiles(new ExamplesFileFilter());
		
		ArrayList<String> withoutSettings	= new ArrayList<>(0);
		
		ArrayList<String> withApply 		= new ArrayList<>(0);
		ArrayList<String> withoutApply 		= new ArrayList<>(0);

		ArrayList<String> withCancel 		= new ArrayList<>(0);
		ArrayList<String> withoutCancel 	= new ArrayList<>(0);
		
		for(File example : examples)
		{
			String fileSuffix = String.format("%s/src/%s/widgets/user-table/UserTable.js", example.getName(), example.getName());
			File exampleTable = new File(RESOURCE_PATH + "table-examples/" + fileSuffix);
			CheckMessagesVerifier tableSettingsVerifier = JavaScriptCheckVerifier.issues(setCheck, exampleTable);
			CheckMessagesVerifier applyCancelVerifier 	= JavaScriptCheckVerifier.issues(acfCheck, exampleTable);
			
			try
			{
				tableSettingsVerifier.next().withMessage(setCheck.getCheckMessages()[0]);
				withoutSettings.add(example.getName());
			}
			
			catch(AssertionError settings)
			{
				try
				{
					applyCancelVerifier.next().withMessage(acfCheck.getCheckMessages()[0]);
					withoutApply.add(example.getName());
				}
				
				catch(AssertionError apply)
				{
					withApply.add(example.getName());
				}
			
				try
				{
					applyCancelVerifier.next().withMessage(acfCheck.getCheckMessages()[1]);
					withoutCancel.add(example.getName());
				}
				
				catch(AssertionError cancel)
				{
					withCancel.add(example.getName());
				}
				
			}
		}
		
		try(Writer writer = logger.getMethodLogger("allExamplesTest"))
		{
			writer.append("\tWithout Settings:\n");
			for(String without : withoutSettings)
			{
				writer.append("\t\t" + without + "\n");
			}
			
			writer.append("\n\n");
			
			writer.append("\tWith Apply button:\n");
			for(String with : withApply)
			{
				writer.append("\t\t" + with + "\n");
			}
			
			writer.append("\n\n");
			
			
			writer.append("\tWith Cancel button:\n");
			for(String with : withCancel)
			{
				writer.append("\t\t" + with + "\n");
			}
		}
		
	}
}
