package org.sonar.ux.checks;

import static org.junit.Assert.assertEquals;

import java.io.IOException;
import java.io.Writer;

import org.junit.Test;

import org.sonar.ux.checks.factory.UXCheckFactory;

import org.sonar.ux.checks.file.BlankFileCheck;

import org.sonar.ux.checks.table.columns.*;

import org.sonar.ux.checks.table.selection.SelectionCheck;

import org.sonar.ux.checks.table.settings.*;

import org.sonar.ux.checks.table.table.TableCheck;

import org.sonar.ux.checks.table.tooltips.TooltipsCheck;

import data.checks.Check;
import data.logging.TestLogger;
import junit.framework.Assert;

public class UXCheckFactoryTest 
{
	@SuppressWarnings("unchecked")
	@Test
	public void AllCheckTests()
	{
		Class<?> [] checks = 	{	
									TableCheck.class, ArrayLiteralResizeCheck.class, ResizableColumnsCheck.class, SelectionCheck.class,
									ApplyCancelFlyoutCheck.class, MandatoryColumnsCheck.class, PinnedColumnsCheck.class, TableSettingsCheck.class,
									TooltipsCheck.class, BlankFileCheck.class
								};
		boolean [] primaries = 	{
									false, false, true, true,
									true, true, true, true, 
									true, false
								};
		
		TestLogger logger = new TestLogger(getClass());
		
		for(int checkIndex = 0; checkIndex < checks.length; checkIndex++)
		{
			try(Writer writer = logger.getMethodLogger("AllCheckTests"))
			{
				writer.append("\tRun " + (checkIndex + 1) + ":\t" + checks[checkIndex].getSimpleName() + "\n");
				Check check = UXCheckFactory.getInstance((Class<? extends Check>) checks[checkIndex]);
				writer.append("\t" + check.isPrimary() + "\n\n");
				assertEquals(primaries[checkIndex], check.isPrimary());
			}
			
			catch(IOException io)
			{
				Assert.fail("Failed to use logger.");
			}
		}
	}
}
