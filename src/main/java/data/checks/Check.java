package data.checks;

import org.sonar.plugins.javascript.api.tree.Tree;
import org.sonar.plugins.javascript.api.visitors.DoubleDispatchVisitorCheck;

/**
 * An abstract helper class for developing SonarQube checks.<p>
 * This class provides standard methods for structuring each check, keeping a standardised order.
 * @author Jack Coffey
 */
public abstract class Check extends DoubleDispatchVisitorCheck
{
	/**
	 * Each check has a set amount of error messages, used to highlight issues and pass information between eachother.<p>
	 * This method is used primarily for testing and scanning files within a check.<p>
	 * e.g: in the check for A, it will be necessary to also check for B and act according to the B error message.<p>
	 * This is done as such <pre>{@code
	 * 	Check check = UXCheckFactory.getInstance(check.class);
	 * 	List<Issue> checkIssues = tableCheck.scanFile(this.getContext());
	 * }</pre>
	 * @return A String array of this check's error messages
	 */
	public abstract String[] getCheckMessages();
	
	
	/**
	 * A Standard use method for every check. This method breaks down how to determine if this file is applicable for this check.
	 * @param tree A representation of a particular portion of code, defined as an Abstract Syntax Tree by SonarQube.
	 * @return A boolean value, True if the file in question is expected to follow this check's rule, False otherwise. <p>
	 * A Table file would return true here for a check of Tables and False for a check of Empty Files.
	 */
	public abstract boolean qualityExpected(Tree tree);
	
	
	/**
	 * A Standard use method for every check. This method identifies the usage of each check's unique elements
	 * @param tree A representation of a particular portion of code, defined as an Abstract Syntax Tree by SonarQube.
	 * @return a boolean value, True if the file in questions contains the expected elements of this check's rule, False otherwise.
	 */
	public abstract boolean qualityPresent(Tree tree);
	
	
	/**
	 * A non-primary Check is one that is used exlusively to assist other checks, as a means of seperating/decomposing responsibilities 
	 * of scanning files for rules.
	 * @return True if this check is primary, otherwise False.
	 */
	public abstract boolean isPrimary();
}
